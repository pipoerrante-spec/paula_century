import { NextResponse } from "next/server";
import { mapRemoteResultToProperty, type RemoteResult } from "../../../lib/properties";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function fetchSuggestions(limit = 4) {
  try {
    const res = await fetch("https://c21.com.bo/v/resultados?json=true", {
      headers: {
        "user-agent": "Mozilla/5.0",
        accept: "application/json",
      },
      next: { revalidate: 900 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    const results: RemoteResult[] = Array.isArray(data?.results)
      ? (data.results.slice(0, limit) as RemoteResult[])
      : [];

    return results.map(mapRemoteResultToProperty);
  } catch (error) {
    console.error("Atlas no pudo obtener sugerencias", error);
    return [];
  }
}

const systemPrompt = `Eres Atlas, asistente de Paula (Century 21 Bolivia). Especialista en propiedades de Bolivia: alquiler, compra y venta. Responde breve, precisa y con tono humano. Captura datos útiles (nombre, WhatsApp, email, zona, presupuesto, tipo de operación y timing) sin ser invasivo. Cuando tengas propiedades en contexto, preséntalas como si estuvieras en chat (sin enlaces), con título, precio, zona y breve nota; menciona que Paula puede coordinar tour o anticrético. Siempre ofrece coordinar con Paula y explica que seguirás por WhatsApp o correo.`;

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ reply: "Configura la OPENAI_API_KEY para activar Atlas." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const userMessages = Array.isArray(body?.messages) ? body.messages : [];

    const suggestions = await fetchSuggestions();

    const lastUser = [...userMessages].reverse().find((m: any) => m?.role === "user")?.content?.toLowerCase?.() || "";
    const keywords = ["equipetrol", "urubó", "santa cruz", "norte", "anticr", "alquiler", "venta"];
    const filtered = suggestions.filter((p) => {
      const loc = (p.location || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      return keywords.some((k) => lastUser.includes(k) && (loc.includes(k) || title.includes(k)));
    });

    const toUse = (filtered.length ? filtered : suggestions).slice(0, 3);

    const suggestionText = toUse
      .map((p, idx) => `${idx + 1}. ${p.title} • ${p.price || "Precio a consultar"} • ${p.location || "Bolivia"}`)
      .join("\n");

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        suggestionText
          ? {
              role: "system",
              content: `Propiedades de Century 21 disponibles ahora (usa si son relevantes):\n${suggestionText}`,
            }
          : null,
        ...userMessages,
      ].filter(Boolean),
      max_tokens: 320,
      temperature: 0.4,
    };

    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!completion.ok) {
      return NextResponse.json({ reply: "Atlas no está disponible ahora mismo. Intenta de nuevo." }, { status: 500 });
    }

    const data = await completion.json();
    const reply = data?.choices?.[0]?.message?.content || "";

    const suggestionList = toUse
      .map((p, idx) => `• ${p.title}\n   ${p.price || "Precio a consultar"} — ${p.location || "Bolivia"}`)
      .join("\n\n");

    const combined = suggestionList
      ? `${reply}\n\nTe puedo mostrar ahora:\n${suggestionList}\nElige una o dime si afinamos zona/presupuesto y coordinamos con Paula.`
      : reply;

    return NextResponse.json({ reply: combined });
  } catch (error) {
    console.error("Atlas error", error);
    return NextResponse.json({ reply: "Hubo un problema. Intenta otra vez en un momento." }, { status: 500 });
  }
}
