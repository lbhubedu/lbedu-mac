import { Catalog } from "@/components/catalog";
import { catalogWithReleases } from "@/lib/releases";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ salvos?: string; ferramenta?: string; buscar?: string }> }) {
  const [list, params] = await Promise.all([catalogWithReleases(), searchParams]);
  const active = typeof params.ferramenta === "string" ? params.ferramenta : "";
  return <Catalog key={`${params.salvos === "1"}:${active}`} initialTools={list} savedOnly={params.salvos === "1"} initialSlug={active} initialQuery={typeof params.buscar === "string" ? params.buscar.slice(0, 120) : ""} />;
}
