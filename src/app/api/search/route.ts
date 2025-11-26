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

  const url = `https://c21.com.bo/v/resultados${segments.length ? `/${segments.join("/")}` : ""}?json=true${
    query ? `&palabra=${encodeURIComponent(query)}` : ""
  }`;

  try {
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        "accept-language": "es-BO,es;q=0.9",
        "user-agent": "Mozilla/5.0",
        referer: "https://c21.com.bo/v/resultados",
      },
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("Century 21 search upstream error", res.status);
      return NextResponse.json(
        { properties: [], total: 0, error: "No se pudo sincronizar con Century 21" },
        { status: 200 },
      );
    }

    const data = await res.json();
    const results: RemoteResult[] = Array.isArray(data?.results) ? data.results : [];
    const filteredByScope =
      scope === "bo"
        ? results
        : results.filter((item) => (item.estado || "").toLowerCase().includes("santa cruz"));
    const properties = filteredByScope.slice(0, limit).map(mapRemoteResultToProperty);

    return NextResponse.json({
      properties,
      total: data?.totalHits ?? properties.length,
    });
  } catch (error) {
    console.error("Search sync error", error);
    return NextResponse.json({ error: "Error interno al buscar" }, { status: 500 });
  }
}
