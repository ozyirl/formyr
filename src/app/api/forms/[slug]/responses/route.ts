import { NextRequest, NextResponse } from "next/server";
import * as actions from "@/actions/actions";
import { db } from "@/db";
import { forms, submissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    console.log("📊 Fetching responses for form:", slug);
    console.log("🔍 Available actions:", Object.keys(actions));

    // Inline implementation as fallback
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // First verify the form belongs to the current user and get form details
    const [form] = await db
      .select({
        id: forms.id,
        title: forms.title,
        schemaJson: forms.schemaJson,
      })
      .from(forms)
      .where(and(eq(forms.slug, slug), eq(forms.userId, userId)));

    if (!form) {
      return NextResponse.json(
        { error: "Form not found or access denied" },
        { status: 404 }
      );
    }

    // Get all responses for this form
    const formResponses = await db
      .select({
        id: submissions.id,
        data: submissions.data,
        submittedAt: submissions.submittedAt,
        ipAddress: submissions.ipAddress,
      })
      .from(submissions)
      .where(eq(submissions.formId, form.id))
      .orderBy(desc(submissions.submittedAt));

    const result = {
      success: true,
      responses: formResponses,
      form: {
        id: form.id,
        title: form.title,
        schema: form.schemaJson,
      },
    };

    console.log(
      "✅ Successfully fetched",
      result.responses.length,
      "responses"
    );

    return NextResponse.json({
      responses: result.responses,
      form: result.form,
    });
  } catch (error) {
    console.error("Error in responses API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
