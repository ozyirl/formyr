import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { forms, submissions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FormData } from "@/actions/actions";

// Validation function to check if submitted data matches form schema
function validateSubmissionData(
  submissionData: Record<string, unknown>,
  formSchema: FormData
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  for (const field of formSchema.fields) {
    if (
      field.required &&
      (!submissionData[field.id] || submissionData[field.id] === "")
    ) {
      errors.push(`Field '${field.name}' is required`);
    }

    // Type-specific validation
    if (submissionData[field.id]) {
      const value = submissionData[field.id];

      switch (field.type) {
        case "email":
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value as string)) {
            errors.push(`Field '${field.name}' must be a valid email address`);
          }
          break;
        case "number":
          if (isNaN(Number(value))) {
            errors.push(`Field '${field.name}' must be a valid number`);
          }
          break;
        case "checkbox":
          if (field.required && !Array.isArray(value)) {
            errors.push(
              `Field '${field.name}' must be an array of selected options`
            );
          }
          break;
        case "select":
        case "radio":
          if (
            field.options &&
            typeof value === "string" &&
            !field.options.includes(value)
          ) {
            errors.push(`Field '${field.name}' contains invalid option`);
          }
          break;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const submissionData = await request.json();

    // Find the form by slug
    const [form] = await db
      .select({
        id: forms.id,
        schemaJson: forms.schemaJson,
        isPublished: forms.isPublished,
      })
      .from(forms)
      .where(eq(forms.slug, slug));

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Check if form is published
    if (!form.isPublished) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Validate submission data against form schema
    const formSchema = form.schemaJson as FormData;
    const validation = validateSubmissionData(submissionData, formSchema);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Get client IP address (optional, for analytics)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ipAddress = forwardedFor?.split(",")[0] || realIp || null;

    // Store the submission
    const [savedSubmission] = await db
      .insert(submissions)
      .values({
        formId: form.id,
        data: submissionData,
        ipAddress,
      })
      .returning();

    console.log("✅ Form submission saved:", savedSubmission.id);

    // Return success response
    return NextResponse.json({
      success: true,
      message: formSchema.successMessage || "Thank you for your submission!",
      submissionId: savedSubmission.id,
      submittedAt: savedSubmission.submittedAt,
    });
  } catch (error) {
    console.error("Error processing form submission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
