"use client";

import Image from "next/image";
import { useState } from "react";
import type { Property, PropertyDetail, RemoteResult } from "../../lib/properties";
import { formatPrice } from "../../lib/properties";

export default function PropertyGrid({ properties }: { properties: Property[] }) {
  const [openProperty, setOpenProperty] = useState<Property | null>(null);
  const [detail, setDetail] = useState<PropertyDetail | null>(null);
  const [detailCache, setDetailCache] = useState<Record<string, PropertyDetail>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const buildKey = (property: Property) =>
    property.id || property.url || property.title || property.location;

  const baseDetail = (property: Property): PropertyDetail => ({
    title: property.title,
    description: `Tour privado con Paula. ${property.highlight}`,
    images: [property.image],
    price: property.price,
    location: property.location,
    stats: property.features,
  });

  const simplifyDescription = (raw: string, fallback: string) => {
    const cleaned = raw.replace(/\s+/g, " ").trim();
    if (!cleaned) return fallback;
    const short = cleaned.slice(0, 380);
    return short.length < cleaned.length ? `${short}…` : short;
  };

  const loadDetail = async (property: Property) => {
    const cacheKey = buildKey(property);
    if (!cacheKey) return;
    if (detailCache[cacheKey]) {
      setDetail(detailCache[cacheKey]);
      return;
    }
    if (!property.url) {
      const fallback = baseDetail(property);
      setDetail(fallback);
      setDetailCache((prev) => ({ ...prev, [cacheKey]: fallback }));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiUrl = `/api/property?url=${encodeURIComponent(property.url.replace(/\/$/, ""))}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("No se pudo cargar la ficha");
      const data = await res.json();
      const entity = (data.entity || data.propiedad || {}) as RemoteResult & {
        descripcion?: string;
        m2T?: number | string | null;
        estacionamientos?: number | null;
        fotos?: Record<string, { large?: string; large1?: string; logo?: string }>;
      };

      const fotosObj: Record<string, { large?: string; large1?: string; logo?: string }> =
        (data.fotos as Record<string, { large?: string; large1?: string; logo?: string }>) || entity.fotos || {};

      const images = Object.values(fotosObj)
        .map((photo) => photo?.large || photo?.large1 || photo?.logo)
        .filter(Boolean) as string[];

      const stats = [
        entity?.m2C ? `${entity.m2C} m² construidos` : null,
        entity?.m2T ? `${entity.m2T} m² terreno` : null,
        entity?.recamaras ? `${entity.recamaras} dormitorios` : null,
        entity?.banos ? `${entity.banos} baños` : null,
        entity?.estacionamientos ? `${entity.estacionamientos} parqueos` : null,
        entity?.tipoPropiedadTrans || entity?.tipoPropiedad || null,
      ].filter(Boolean) as string[];

      const description = simplifyDescription(
        typeof entity.descripcion === "string" ? entity.descripcion : "",
        property.highlight,
      );

      const lat = entity?.lat ?? entity?.latitud ?? null;
      const lon = entity?.lon ?? entity?.longitud ?? null;
      const latNum = typeof lat === "string" || typeof lat === "number" ? Number(lat) : NaN;
      const lonNum = typeof lon === "string" || typeof lon === "number" ? Number(lon) : NaN;
      const hasCoords = Number.isFinite(latNum) && Number.isFinite(lonNum);
      const address = [entity?.calle, entity?.colonia, entity?.municipio, entity?.estado]
        .filter(Boolean)
        .join(", ")
        .trim();

      const detailData: PropertyDetail = {
        title: entity.encabezado || property.title,
        description,
        images: images.length ? images : [property.image],
        price: formatPrice(entity) || property.price,
        location:
          [entity.municipio, entity.estado]
            .filter(Boolean)
            .join(", ")
            .trim() || property.location,
        stats: stats.length ? stats : property.features,
        map: hasCoords
          ? {
              lat: latNum,
              lon: lonNum,
              address: address || undefined,
            }
          : undefined,
      };

      setDetail(detailData);
      setActiveIndex(0);
      setDetailCache((prev) => ({ ...prev, [cacheKey]: detailData }));
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la ficha completa. Usa el formulario para más detalles.");
      const fallback = baseDetail(property);
      setDetail(fallback);
      setActiveIndex(0);
      setDetailCache((prev) => ({ ...prev, [cacheKey]: fallback }));
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (property: Property) => {
    setOpenProperty(property);
    loadDetail(property);
    setActiveIndex(0);
  };

  const closeModal = () => {
    setOpenProperty(null);
    setDetail(null);
    setError(null);
    setLoading(false);
    setActiveIndex(0);
  };

  const currentDetail = detail || (openProperty ? baseDetail(openProperty) : null);
  const gallery = currentDetail?.images && currentDetail.images.length ? currentDetail.images : [];
  const showImage = gallery[activeIndex] || gallery[0];
  const mapData = currentDetail?.map;
  const mapEmbedUrl =
    mapData &&
    (() => {
      const delta = 0.012;
      const bbox = `${mapData.lon - delta},${mapData.lat - delta},${mapData.lon + delta},${mapData.lat + delta}`;
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${mapData.lat}%2C${mapData.lon}`;
    })();
  const mapLink = mapData
    ? `https://www.openstreetmap.org/?mlat=${mapData.lat}&mlon=${mapData.lon}#map=14/${mapData.lat}/${mapData.lon}`
    : null;

  const goNext = () => {
    if (!gallery.length) return;
    setActiveIndex((prev) => (prev + 1) % gallery.length);
  };

  const goPrev = () => {
    if (!gallery.length) return;
    setActiveIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <>
      <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((property, index) => (
          <div
            key={(property.url || property.id || property.title || "propiedad") + index}
            className="group relative cursor-pointer overflow-hidden rounded-[22px] border border-[var(--line)] bg-white/90 shadow-[var(--shadow)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_32px_90px_rgba(23,18,10,0.16)]"
            onClick={() => handleOpen(property)}
          >
            <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-700 group-hover:opacity-100">
              <div className="card-spotlight" />
            </div>
            <div className="relative h-52 w-full overflow-hidden">
              <Image
                src={property.image}
                alt={property.title}
                fill
                sizes="(min-width: 1024px) 320px, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute left-4 right-4 top-4 flex items-center gap-2 opacity-0 transition duration-500 group-hover:opacity-100">
                <span className="rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                  {property.badge}
                </span>
                <span className="rounded-full border border-white/50 bg-white/20 px-3 py-1 text-xs text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
                  {property.highlight}
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <p className="text-lg font-semibold text-white">{property.title}</p>
                <p className="text-sm text-white/80">{property.location}</p>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold text-[var(--gold)]">{property.price}</p>
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
                  Tour privado
                </span>
              </div>
              <div className="space-y-2 text-sm text-[var(--muted)]">
                {property.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-2.5 text-xs font-semibold text-[#1a1713] shadow-[0_12px_40px_rgba(23,18,10,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(23,18,10,0.18)]"
                  onClick={() => handleOpen(property)}
                >
                  Ver detalles
                </button>
                <a
                  href="#contacto"
                  className="flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-xs font-semibold text-[var(--muted)] transition hover:-translate-y-0.5 hover:border-[var(--gold)] hover:text-[var(--ink)]"
                >
                  Agendar con Paula
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {openProperty ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_30px_120px_rgba(23,18,10,0.28)]">
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--muted)] transition hover:border-[var(--gold)] hover:text-[var(--ink)]"
            >
              ×
            </button>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div className="space-y-3 p-6">
                <div className="relative h-[280px] w-full overflow-hidden rounded-2xl bg-white sm:h-[340px]">
                  {showImage ? (
                    <Image src={showImage} alt={currentDetail?.title || "Galería"} fill sizes="(min-width: 1024px) 620px, 100vw" className="object-cover" />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  {gallery.length > 1 ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
                      <button
                        type="button"
                        onClick={goPrev}
                        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65"
                        aria-label="Imagen anterior"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={goNext}
                        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65"
                        aria-label="Imagen siguiente"
                      >
                        ›
                      </button>
                    </div>
                  ) : null}
                </div>
                {gallery.length > 1 ? (
                  <div className="grid max-h-[180px] grid-cols-3 gap-2 overflow-y-auto pr-1">
                    {gallery.slice(0, 12).map((img, idx) => (
                      <button
                        type="button"
                        key={img}
                        onClick={() => setActiveIndex(idx)}
                        className={`relative h-24 w-full overflow-hidden rounded-xl border ${
                          activeIndex === idx
                            ? "border-[var(--gold)] shadow-[0_0_0_2px_rgba(217,176,90,0.2)]"
                            : "border-[var(--line)]"
                        } bg-white transition hover:-translate-y-0.5`}
                      >
                        <Image src={img} alt={currentDetail?.title || "Galería"} fill sizes="150px" className="object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col gap-4 p-6 lg:max-h-[80vh] lg:overflow-y-auto">
                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    Ficha exclusiva con Paula Guerra
                  </p>
                  <p className="text-2xl font-semibold leading-tight text-[var(--ink)]">
                    {currentDetail?.title || openProperty.title}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {currentDetail?.location || openProperty.location}
                  </p>
                  <p className="text-lg font-semibold text-[var(--gold)]">
                    {currentDetail?.price || openProperty.price}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                  {(currentDetail?.stats || openProperty.features).map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-[var(--line)] bg-white px-3 py-1"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--muted)]">
                  {currentDetail?.description || openProperty.highlight}
                </p>
                {mapEmbedUrl ? (
                  <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/90 p-3 shadow-[0_12px_40px_rgba(23,18,10,0.08)]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">Ubicación verificada</p>
                        <p className="text-sm font-semibold text-[var(--ink)]">
                          {mapData?.address || currentDetail?.location || openProperty.location}
                        </p>
                      </div>
                      {mapLink ? (
                        <a
                          href={mapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[11px] font-semibold text-[var(--muted)] transition hover:-translate-y-0.5 hover:border-[var(--gold)] hover:text-[var(--ink)]"
                        >
                          Ver en mapa
                          <span aria-hidden="true">↗</span>
                        </a>
                      ) : null}
                    </div>
                    <div className="relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
                      <iframe
                        src={mapEmbedUrl}
                        className="h-56 w-full"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        aria-label="Mapa de ubicación"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                    </div>
                  </div>
                ) : null}
                {loading ? <p className="text-xs text-[var(--muted)]">Cargando detalles y galería...</p> : null}
                {error ? (
                  <p className="rounded-xl border border-red-400/30 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                  </p>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <a
                    href="#contacto"
                    className="flex items-center justify-center rounded-full bg-[var(--gold)] px-4 py-3 text-xs font-semibold text-[var(--ink)] shadow-[0_12px_40px_rgba(23,18,10,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(23,18,10,0.18)]"
                  >
                    Agenda con Paula
                  </a>
                  <a
                    href="https://wa.me/59169040849"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center rounded-full border border-[var(--line)] bg-white px-4 py-3 text-xs font-semibold text-[var(--muted)] transition hover:-translate-y-0.5 hover:border-[var(--gold)] hover:text-[var(--ink)]"
                  >
                    WhatsApp directo
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
