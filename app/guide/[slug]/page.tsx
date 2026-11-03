import { notFound } from "next/navigation";
import { guides } from "@/lib/guides";
import { readGuide } from "@/lib/store";
import { GuideDetail } from "@/components/guide-detail";
export const revalidate = 3600;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug) || (await readGuide(slug));
  return {
    title: guide ? `${guide.name} OAuth setup guide` : "Guide not found",
    description: guide?.summary,
    robots: guides.some((g) => g.slug === slug)
      ? undefined
      : { index: false, follow: false },
  };
}
export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug) || (await readGuide(slug));
  if (!guide) notFound();
  return <GuideDetail guide={guide} />;
}
