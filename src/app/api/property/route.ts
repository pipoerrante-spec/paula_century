import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url || !url.startsWith("https://c21.com.bo/propiedad")) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const detailUrl = url.includes("?") ? `${url}&json=true` : `${url}?json=true`;

  try {
    const res = await fetch(detailUrl, {
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "No se pudo obtener la ficha" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("No se pudo obtener la ficha remota", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
