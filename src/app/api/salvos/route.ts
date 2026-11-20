import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { savedTools } from "@/db/schema";
import { toolsBySlug } from "@/lib/data/catalog";
import { fallbackSavedCookie, parseSavedCookie, validVisitor, visitorCookie } from "@/lib/favorites";

export async function PUT(request: NextRequest) {
  if (!request.headers.get("content-type")?.includes("application/json") || Number(request.headers.get("content-length") ?? 0) > 1500) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }
  const body = await request.json().catch(() => null);
  if (!body || typeof body.slug !== "string" || !Object.hasOwn(toolsBySlug, body.slug) || typeof body.saved !== "boolean") {
    return NextResponse.json({ error: "Ferramenta inválida." }, { status: 400 });
  }

  const secure = request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  const currentList = parseSavedCookie(request.cookies.get(fallbackSavedCookie)?.value);
  const nextList = body.saved
    ? [...new Set([...currentList, body.slug])].slice(0, 60)
    : currentList.filter((slug) => slug !== body.slug);

  const writeCookieFallback = (response: NextResponse) => {
    response.cookies.set(fallbackSavedCookie, nextList.join(","), {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  };

  if (!db) {
    return writeCookieFallback(NextResponse.json({ ok: true }));
  }

  const current = request.cookies.get(visitorCookie)?.value;
  if (!body.saved && !validVisitor(current)) return writeCookieFallback(NextResponse.json({ ok: true }));
  const visitor = validVisitor(current) ? current : crypto.randomUUID();
  try {
    if (body.saved) await db.insert(savedTools).values({ visitor, slug: body.slug }).onConflictDoNothing();
    else await db.delete(savedTools).where(and(eq(savedTools.visitor, visitor), eq(savedTools.slug, body.slug)));
    const response = NextResponse.json({ ok: true });
    if (!validVisitor(current)) {
      response.cookies.set(visitorCookie, visitor, { httpOnly: true, sameSite: "lax", secure, path: "/", maxAge: 60 * 60 * 24 * 365 });
    }
    return writeCookieFallback(response);
  } catch {
    return writeCookieFallback(NextResponse.json({ ok: true }));
  }
}
