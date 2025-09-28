"use server";

import { db } from "@/db";
import { forms } from "@/db/schema";

export interface FormData {
  title: string;
  description: string;
  fields: Array<{
    id: string;
    name: string;
    type:
      | "text"
      | "email"
      | "number"
      | "textarea"
      | "select"
      | "checkbox"
      | "radio"
      | "date"
      | "file";
    required: boolean;
    placeholder?: string;
    options?: string[];
  }>;
  submitText: string;
  successMessage: string;
}

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Remove duplicate hyphens
      .trim() +
    "-" +
    Date.now()
  ); // Add timestamp for uniqueness
}

export async function saveForm(formData: FormData) {
  try {
    console.log("🗄️ saveForm called with:", formData);
    console.log("🔌 DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log(
      "🔌 DATABASE_URL value:",
      process.env.DATABASE_URL ? "***configured***" : "undefined"
    );

    const slug = generateSlug(formData.title);
    console.log("🔗 Generated slug:", slug);

    // Test database connection
    try {
      console.log("🧪 Testing database connection...");
      await db.select().from(forms).limit(1);
      console.log("✅ Database connection successful");
    } catch (dbError) {
      console.error("❌ Database connection failed:", dbError);
      throw new Error(`Database connection error: ${dbError}`);
    }

    const [savedForm] = await db
      .insert(forms)
      .values({
        slug,
        title: formData.title,
        description: formData.description,
        schemaJson: formData,
        isPublished: true, // Auto-publish forms created by AI
      })
      .returning();

    console.log("✅ Form inserted into database:", savedForm);

    return {
      success: true,
      form: savedForm,
      url: `/f/${slug}`,
    };
  } catch (error) {
    console.error("Error saving form:", error);
    return {
      success: false,
      error: "Failed to save form to database",
    };
  }
}
