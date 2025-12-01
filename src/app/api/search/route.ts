import { NextResponse } from "next/server";
import { mapRemoteResultToProperty, type RemoteResult } from "../../../lib/properties";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const type = searchParams.get("type")?.toLowerCase() || "";
  const operation = searchParams.get("operation")?.toLowerCase() || "";
  const beds = searchParams.get("beds") || "";
  const baths = searchParams.get("baths") || "";
  const scope = searchParams.get("scope") === "bo" ? "bo" : "sc";

  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : 12;
  const pageParam = Number(searchParams.get("page"));
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.min(pageParam, 200) : 1;
  const remotePageSize = 100;
  const startIndex = (page - 1) * limit;
  const withinRemoteIndex = startIndex % remotePageSize;
  const remotePage = Math.floor(startIndex / remotePageSize) + 1;

  const allowedTypes = new Set([
    "casa",
    "casa-en-condominio",
    "departamento",
    "penthouse",
    "terreno",
    "oficinas",
    "local-comercial",
  ]);
  const allowedOperations = new Set(["venta", "renta"]);
  const allowedNumbers = new Set(["1", "2", "3", "4", "5"]);

  const segments: string[] = [];
  if (allowedOperations.has(operation)) {
    segments.push(`operacion_${operation}`);
  }
  if (allowedTypes.has(type)) {
    segments.push(`tipo_${type}`);
  }
  if (allowedNumbers.has(beds)) {
    segments.push(`recamaras_${beds}`);
  }
  if (allowedNumbers.has(baths)) {
    segments.push(`banos_${baths}`);
  }

  const buildUrl = (pageToFetch: number) =>
    `https://c21.com.bo/v/resultados${segments.length ? `/${segments.join("/")}` : ""}?json=true${
      query ? `&palabra=${encodeURIComponent(query)}` : ""
    }&page=${pageToFetch}`;

  const fetchRemote = async (pageToFetch: number) => {
    const res = await fetch(buildUrl(pageToFetch), {
      headers: {
        accept: "application/json",
        "accept-language": "es-BO,es;q=0.9",
        "user-agent": "Mozilla/5.0",
        referer: "https://c21.com.bo/v/resultados",
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });
    return res;
  };

  try {
    const res = await fetchRemote(remotePage);
    if (!res.ok) {
      console.error("Century 21 search upstream error", res.status);
      return NextResponse.json(
        { properties: [], total: 0, error: "No se pudo sincronizar con Century 21" },
        { status: 200 },
      );
    }

    const data = await res.json();
    const results: RemoteResult[] = Array.isArray(data?.results) ? data.results : [];
    const needsExtraPage = withinRemoteIndex + limit > remotePageSize;
    let extraResults: RemoteResult[] = [];

    if (needsExtraPage) {
      try {
        const resNext = await fetchRemote(remotePage + 1);
        if (resNext.ok) {
          const dataNext = await resNext.json();
          extraResults = Array.isArray(dataNext?.results) ? (dataNext.results as RemoteResult[]) : [];
        }
      } catch (err) {
        console.warn("No se pudo traer la página siguiente de Century 21", err);
      }
    }

    const combined = [...results, ...extraResults];
    const filteredByScope =
      scope === "bo"
        ? combined
        : combined.filter((item) => (item.estado || "").toLowerCase().includes("santa cruz"));

    const properties = filteredByScope
      .slice(withinRemoteIndex, withinRemoteIndex + limit)
      .map(mapRemoteResultToProperty);

    const totalRaw = data?.totalHits ?? filteredByScope.length;
    const total =
      typeof totalRaw === "number"
        ? totalRaw
        : Number(String(totalRaw || "").replace(/[^\d]/g, "")) || filteredByScope.length;

    return NextResponse.json({
      properties,
      total,
      page,
      pageSize: limit,
      hasMore: startIndex + limit < total,
    });
  } catch (error) {
    console.error("Search sync error", error);
    return NextResponse.json({ error: "Error interno al buscar" }, { status: 500 });
  }
}
