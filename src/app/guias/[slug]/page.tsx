import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideView } from "@/components/guide-view";
import { guidesBySlug } from "@/lib/data/guides";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = guidesBySlug[(await params).slug];
  return guide ? { title: guide.title, description: guide.summary } : { title: "Guia não encontrado" };
}

export default async function GuideDetailPage({ params }: Props) {
  const guide = guidesBySlug[(await params).slug];
  if (!guide) notFound();
  return <GuideView guide={guide} />;
}
