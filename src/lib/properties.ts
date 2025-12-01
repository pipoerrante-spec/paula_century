export type Property = {
  id?: string;
  title: string;
  location: string;
  price: string;
  features: string[];
  badge: string;
  highlight: string;
  image: string;
  url?: string;
};

export type PropertyDetail = {
  title: string;
  description?: string;
  images: string[];
  price: string;
  location: string;
  stats: string[];
  map?: {
    lat: number;
    lon: number;
    address?: string;
  };
};

export type RemoteResult = {
  id?: number | string;
  idPropiedadesDB?: string;
  precios?: {
    principal?: { precio?: number | string; moneda?: string; precioFormat?: string | null } | null;
  };
  precioMapa?: number | string | null;
  precio?: number | string | null;
  precioFormat?: string | null;
  moneda?: string | null;
  m2C?: number | null;
  m2T?: number | null | string;
  recamaras?: number | null;
  banos?: number | null;
  estacionamientos?: number | null;
  fotos?: { propiedadThumbnail?: string[] };
  encabezado?: string;
  municipio?: string;
  estado?: string;
  exclusiva?: boolean;
  etiquetas?: { label?: string | null }[] | null;
  lat?: number | string | null;
  lon?: number | string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  calle?: string | null;
  colonia?: string | null;
  tipoPropiedadEnTipoOperacion?: string;
  tipoOperacionTxt?: string;
  tipoPropiedad?: string;
  tipoPropiedadTrans?: string;
  urlCorrectaPropiedad?: string;
  descripcion?: string;
};

export const DEFAULT_PROPERTY_IMAGE =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80";

export function formatPrice(raw: RemoteResult) {
  const principal = raw?.precios?.principal ?? null;
  const fallbackText = principal?.precioFormat || raw?.precioFormat || "Consultar valor";
  const value = principal?.precio ?? raw?.precioMapa ?? raw?.precio ?? null;
  const currency = principal?.moneda || raw?.moneda || "USD";

  if (typeof value === "number" || (typeof value === "string" && !Number.isNaN(Number(value)))) {
    try {
      const number = Number(value);
      const formatted = new Intl.NumberFormat("es-BO", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(number);
      return formatted;
    } catch {
      return fallbackText;
    }
  }
  return fallbackText;
}

export function mapRemoteResultToProperty(item: RemoteResult): Property {
  const features = [
    item?.m2C ? `${item.m2C} m² construidos` : null,
    item?.recamaras ? `${item.recamaras} dormitorios` : null,
    item?.banos ? `${item.banos} baños` : null,
  ].filter(Boolean) as string[];

  const image = item?.fotos?.propiedadThumbnail?.[0] || DEFAULT_PROPERTY_IMAGE;

  return {
    id: item?.idPropiedadesDB || (item?.id ? String(item.id) : undefined),
    title: item?.encabezado || "Propiedad Century 21",
    location: [item?.municipio, item?.estado].filter(Boolean).join(", "),
    price: formatPrice(item),
    features: features.length
      ? features
      : ["Agenda para conocer los detalles", "Listado verificado por Century 21"],
    badge: item?.exclusiva ? "Exclusiva Century 21" : item?.etiquetas?.[0]?.label || "Disponible",
    highlight: item?.tipoPropiedadEnTipoOperacion || item?.tipoOperacionTxt || "Oportunidad",
    image,
    url: item?.urlCorrectaPropiedad
      ? `https://c21.com.bo${item.urlCorrectaPropiedad}`
      : "https://c21.com.bo/",
  };
}
