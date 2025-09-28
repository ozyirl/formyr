"use server";

import { db } from "@/db";
import { forms } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { desc } from "drizzle-orm";

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
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim() +
    "-" +
    Date.now()
  );
}

export async function saveForm(formData: FormData, userId?: string) {
  try {
    console.log("🗄️ saveForm called with:", formData);
    console.log("🔌 DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log(
      "🔌 DATABASE_URL value:",
      process.env.DATABASE_URL ? "***configured***" : "undefined"
    );

    let currentUserId = userId;
    if (!currentUserId) {
      const { userId: authUserId } = await auth();
      if (!authUserId) {
        throw new Error("User not authenticated");
      }
      currentUserId = authUserId;
    }

    console.log("👤 Using userId:", currentUserId);

    const slug = generateSlug(formData.title);
    console.log("🔗 Generated slug:", slug);

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
        isPublished: true,
        userId: currentUserId,
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

export async function getForms(userId?: string) {
  try {
    let currentUserId = userId;
    if (!currentUserId) {
      const { userId: authUserId } = await auth();
      if (!authUserId) {
        throw new Error("User not authenticated");
      }
      currentUserId = authUserId;
    }

    const userForms = await db
      .select()
      .from(forms)
      .where(eq(forms.userId, currentUserId))
      .orderBy(desc(forms.createdAt));

    return {
      success: true,
      forms: userForms,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to fetch forms",
      forms: [],
    };
  }
}
