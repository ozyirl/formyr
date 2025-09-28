import PublicFormClient from "@/app/f/[slug]/PublicFormClient";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <PublicFormClient slug={slug} />;
}
