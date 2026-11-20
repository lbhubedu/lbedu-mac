import { toolsBySlug } from "@/lib/data/catalog";
import { releaseForTool } from "@/lib/releases";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = Object.hasOwn(toolsBySlug, slug) ? toolsBySlug[slug] : undefined;
  if (!tool) return Response.json({ error: "Ferramenta não encontrada." }, { status: 404 });
  return Response.json({ release: await releaseForTool(tool) }, { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=900" } });
}
