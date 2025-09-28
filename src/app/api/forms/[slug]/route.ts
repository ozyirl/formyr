import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Find the form by slug
    const [form] = await db
      .select({
        id: forms.id,
        slug: forms.slug,
        title: forms.title,
        description: forms.description,
        schemaJson: forms.schemaJson,
        isPublished: forms.isPublished,
        createdAt: forms.createdAt,
        updatedAt: forms.updatedAt,
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

    // Return the form schema (excluding sensitive data like userId)
    return NextResponse.json({
      id: form.id,
      slug: form.slug,
      title: form.title,
      description: form.description,
      schema: form.schemaJson,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
