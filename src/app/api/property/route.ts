import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url || !url.startsWith("https://c21.com.bo/propiedad")) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const detailUrl = url.includes("?") ? `${url}&json=true` : `${url}?json=true`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(detailUrl, {
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0",
      },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn("Ficha C21 no disponible", res.status, detailUrl);
      return NextResponse.json({ error: "No se pudo obtener la ficha remota", entity: null }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("Timeout al obtener la ficha remota", detailUrl);
    } else {
      console.error("No se pudo obtener la ficha remota", error);
    }
    return NextResponse.json({ error: "No se pudo obtener la ficha remota", entity: null }, { status: 200 });
  }
}
