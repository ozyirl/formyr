import { db } from "@/db";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";
import FormPageClient from "./FormPageClient";

export default async function FormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [form] = await db.select().from(forms).where(eq(forms.slug, slug));

  if (!form) {
    return <div className="p-6">Form not found</div>;
  }

  return <FormPageClient form={form} slug={slug} />;
}
