import { Generator } from "@/components/generator";
export const metadata = {
  title: "Research an integration",
  robots: { index: false },
};
export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; refresh?: string }>;
}) {
  const { q, refresh } = await searchParams;
  return (
    <Generator
      initial={typeof q === "string" ? q.slice(0, 180) : ""}
      refresh={refresh === "1"}
    />
  );
}
