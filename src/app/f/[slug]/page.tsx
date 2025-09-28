import { db } from "@/db";
import { forms } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function FormPage({
  params,
}: {
  params: { slug: string };
}) {
  // fetch from DB by slug
  const [form] = await db
    .select()
    .from(forms)
    .where(eq(forms.slug, params.slug));

  if (!form) {
    return <div className="p-6">Form not found</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold">{form.title}</h1>
      {form.description && <p className="text-gray-600">{form.description}</p>}
      <pre className="bg-gray-100 p-2 mt-4 rounded text-sm">
        {JSON.stringify(form.schemaJson, null, 2)}
      </pre>
    </div>
  );
}
