import { NextResponse } from "next/server";
import { mapRemoteResultToProperty, type Property, type RemoteResult } from "../../../lib/properties";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

const zoneAliases = [
  {
    label: "Zona Norte / Av. Banzer (Los Valles)",
    keywords: ["valles", "los valles", "banzer", "bánzer", "8vo anillo", "octavo anillo", "anillo norte"],
    query: "Los Valles Av. Banzer Zona Norte Santa Cruz",
  },
  {
    label: "Av. Alemana / 4to-6to anillo (Zona Norte)",
    keywords: ["alemana", "av alemana", "avenida alemana"],
    query: "Avenida Alemana Santa Cruz Bolivia 4to anillo",
  },
  {
    label: "Av. Beni / 3er-5to anillo (Zona Norte)",
    keywords: ["beni", "av beni", "avenida beni"],
    query: "Avenida Beni Santa Cruz Bolivia",
  },
  {
    label: "Equipetrol / San Martín",
    keywords: ["equipetrol", "equiptrol", "san martin", "san martín", "zona norte"],
    query: "Equipetrol Norte Santa Cruz",
  },
  {
    label: "Urubó / Porongo",
    keywords: ["urubo", "urubó", "porongo", "colinas del urubo", "colinas del urubó"],
    query: "Urubó Colinas del Urubó Porongo Santa Cruz",
  },
  {
    label: "Las Palmas / Zona Sur",
    keywords: ["las palmas", "palmas", "doble via", "doble vía", "la guardia", "zona sur", "radial 17", "radial 13"],
    query: "Las Palmas Zona Sur Santa Cruz",
  },
  {
    label: "Centro / Anillos 1-2",
    keywords: ["centro", "casco viejo", "primer anillo", "segundo anillo", "monseñor", "manzana uno"],
    query: "Centro Santa Cruz anillo",
  },
  {
    label: "Parque Industrial / Cotoca",
    keywords: ["parque industrial", "cotoca", "carretera a cotoca", "warnes", "montero"],
    query: "Parque Industrial Carretera a Cotoca Santa Cruz",
  },
];

const santaCruzGuide = `Mapa express de Santa Cruz para interpretar zonas y typos:
- Zona Norte / Equipetrol / Av. Banzer (Los Valles, San Martín, 4to-8vo anillo).
- Av. Alemana (4to-6to anillo) y Av. Beni (3er-5to anillo) son ejes de zona norte.
- Urubó y Porongo (Colinas del Urubó): condominios privados, casas con club house y lotes amplios.
- Zona Sur / Las Palmas / Doble vía La Guardia: zonas familiares, colegios y club de tenis.
- Centro y anillos 1-2: oficinas y deptos cerca de servicios.
- Parque Industrial / Carretera a Cotoca: uso comercial e industrial.
"Valles" o "Banzer" => Zona Norte; "Palmas" o "Doble vía" => Zona Sur; "Urubó/Urubo" => lado Porongo.`;

const systemPrompt = `Eres Atlas, asistente de Paula (Century 21 Bolivia). Especialista en propiedades de Bolivia. Responde brevísimo, claro, con emojis y bullets; máximo 3-4 líneas. Interpreta zonas de Santa Cruz aunque vengan con errores (ej: "valles" = Av. Banzer, "aleman" = Av. Alemana, "beni" = Av. Beni). Pide solo lo esencial (WhatsApp, rango USD, zona, tipo casa/depto, tiempos). Cuando tengas propiedades en contexto, menciona título, precio, zona y link directo de Century 21; aclara que allí están fotos/galería y que Paula coordina tour. Termina con CTA corta (ej: "📲 Mándame tu WhatsApp y agendo con Paula").`;

type IncomingMessage = { role?: string; content?: string };

const normalizeText = (text: string) =>
  (text || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

function detectZones(message: string) {
  const normalized = normalizeText(message);
  return zoneAliases.filter((zone) => zone.keywords.some((kw) => normalized.includes(kw)));
}

function extractFilters(message: string) {
  const normalized = normalizeText(message);
  const operation = normalized.match(/alquil|renta|anticret/) ? "renta" : normalized.match(/venta|vendo|compro|comprar/) ? "venta" : "";
  const typeMatch = [
    { value: "casa", tokens: ["casa", "chalet", "quinta", "hogar"] },
    { value: "departamento", tokens: ["departamento", "depto", "dpto", "apto", "apart", "penthouse", "ph"] },
    { value: "terreno", tokens: ["terreno", "lote", "lot", "solar"] },
    { value: "oficinas", tokens: ["oficina", "oficinas"] },
    { value: "local-comercial", tokens: ["local", "comercial", "tienda"] },
  ].find((entry) => entry.tokens.some((token) => normalized.includes(token)));
  const bedsMatch = normalized.match(/(\d+)\s*(hab|dorm|suite|cuarto)/);
  const beds = bedsMatch && allowedNumbers.has(bedsMatch[1]) ? bedsMatch[1] : "";
  const scope = /la paz|cochabamba|tarija|beni|pando|sucre|oruro|potosi|potosí/.test(normalized) ? "bo" : "sc";
  return { operation, type: typeMatch?.value || "", beds, scope };
}

async function searchCentury({
  keyword = "",
  type = "",
  operation = "",
  beds = "",
  baths = "",
  scope = "sc",
  limit = 6,
}: {
  keyword?: string;
  type?: string;
  operation?: string;
  beds?: string;
  baths?: string;
  scope?: "sc" | "bo";
  limit?: number;
}): Promise<{ properties: Property[]; total: number }> {
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
  const keywordParam = keyword.trim();
  const url = `https://c21.com.bo/v/resultados${segments.length ? `/${segments.join("/")}` : ""}?json=true${
    keywordParam ? `&palabra=${encodeURIComponent(keywordParam)}` : ""
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
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return { properties: [], total: 0 };
    }
    const data = await res.json();
    const results: RemoteResult[] = Array.isArray(data?.results) ? data.results : [];
    const filtered =
      scope === "bo"
        ? results
        : results.filter((item) => (item.estado || "").toLowerCase().includes("santa cruz"));
    const properties = filtered.slice(0, limit).map(mapRemoteResultToProperty);
    const totalRaw = data?.totalHits ?? properties.length;
    const total =
      typeof totalRaw === "number"
        ? totalRaw
        : Number(String(totalRaw || "").replace(/[^\d]/g, "")) || properties.length;
    return { properties, total };
  } catch (error) {
    console.error("Atlas search error", error);
    return { properties: [], total: 0 };
  }
}

async function fetchSuggestions(limit = 4) {
  const { properties } = await searchCentury({ limit, scope: "sc" });
  return properties;
}

export async function POST(req: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ reply: "Configura la OPENAI_API_KEY para activar Atlas." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const userMessages: IncomingMessage[] = Array.isArray(body?.messages) ? body.messages : [];

    const lastUser = [...userMessages].reverse().find((m) => m?.role === "user")?.content || "";
    const zoneHits = detectZones(lastUser);
    const filters = extractFilters(lastUser);
    const keywordBase = zoneHits.length ? zoneHits.map((z) => z.query).join(" ") : lastUser || "Santa Cruz Bolivia";
    const keyword = keywordBase.slice(0, 140);

    const searchResult = await searchCentury({
      keyword,
      type: filters.type,
      operation: filters.operation,
      beds: filters.beds,
      scope: filters.scope as "sc" | "bo",
      limit: 6,
    });

    const suggestions = searchResult.properties.length ? searchResult.properties : await fetchSuggestions(6);
    const shortlist = suggestions.slice(0, 4);

    const propertyContext = shortlist
      .map(
        (p, idx) =>
          `${idx + 1}. ${p.title} — ${p.price || "Consultar"} • ${p.location || "Santa Cruz"} • ${
            p.url || "https://c21.com.bo"
          }`,
      )
      .join("\n");

    const zoneHintText = zoneHits.length
      ? `Zonas detectadas en la consulta: ${zoneHits.map((z) => z.label).join(", ")}.`
      : "Si no indican ciudad, asume Santa Cruz (Zona Norte, Urubó/Porongo, Zona Sur, Centro).";

    const payload = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "system", content: santaCruzGuide },
        zoneHintText ? { role: "system", content: zoneHintText } : null,
        propertyContext
          ? {
              role: "system",
              content: `Propiedades de Century 21 relevantes (incluye el link en tu respuesta si aplican):\n${propertyContext}`,
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

    const suggestionList = shortlist
      .map(
        (p) =>
          `🏠 ${p.title}\n💰 ${p.price || "Consultar"} • ${p.location || "Bolivia"}\n🔗 ${p.url || "https://c21.com.bo"}`,
      )
      .join("\n\n");

    const combined = suggestionList
      ? `${reply}\n\nOpciones rápidas:\n${suggestionList}\n📲 Envíame tu WhatsApp y agendo tour con Paula.`
      : reply;

    return NextResponse.json({ reply: combined, properties: shortlist });
  } catch (error) {
    console.error("Atlas error", error);
    return NextResponse.json({ reply: "Hubo un problema. Intenta otra vez en un momento." }, { status: 500 });
  }
}
