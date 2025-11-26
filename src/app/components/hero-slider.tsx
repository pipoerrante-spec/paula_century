"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Slide = {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondary?: string;
  image: string;
};

export default function HeroSlider({ slides }: { slides: Slide[] }) {
  const preparedSlides = useMemo(
    () =>
      slides.length
        ? slides
        : [
            {
              title: "Servicios integrales",
              description:
                "Boutique inmobiliaria: producción, reforma y acompañamiento completo.",
              ctaLabel: "Ver inmuebles",
              ctaHref: "#propiedades",
              secondary: "Agenda con Paula Guerra",
              image:
                "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
            },
          ],
    [slides],
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (preparedSlides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % preparedSlides.length);
    }, 6200);
    return () => clearInterval(id);
  }, [preparedSlides.length]);

  const goTo = (next: number) => {
    const total = preparedSlides.length;
    if (!total) return;
    setIndex(((next % total) + total) % total);
  };

  const prev = () => goTo(index - 1);
  const next = () => goTo(index + 1);

  const current = preparedSlides[index];

  return (
    <div className="relative h-[88vh] min-h-[620px] w-full overflow-hidden bg-black">
      {preparedSlides.map((slide, idx) => (
        <div
          key={`${slide.title}-${idx}`}
          className={`absolute inset-0 transition-opacity duration-900 ${
            idx === index ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="100vw"
            priority={idx === 0}
            className="object-cover hero-soft-zoom"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/68 via-black/38 to-black/18" />

      <div className="absolute inset-0">
        <div className="hero-gridlines opacity-40" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-center px-6 lg:px-20">
        <div className="max-w-2xl space-y-4 text-left text-white drop-shadow-md">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">Paula Guerra • Century 21</p>
          <h1 className="text-4xl font-semibold leading-[1.02] md:text-5xl lg:text-[3.6rem]">
            <span className="font-[var(--font-display)] uppercase">{current.title}</span>
          </h1>
          {current.description ? (
            <p className="text-lg text-white/85 md:text-xl">{current.description}</p>
          ) : null}
          {current.secondary ? <p className="text-sm text-white/70">{current.secondary}</p> : null}
          <div className="flex flex-wrap gap-3 pt-2">
            {current.ctaLabel ? (
              <a
                href={current.ctaHref || "#contacto"}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1a1713] shadow-[0_14px_50px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5"
              >
                {current.ctaLabel}
              </a>
            ) : null}
            <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-full border border-white/60 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              Agenda una llamada
            </a>
          </div>
        </div>
      </div>

      <div className="absolute inset-y-0 left-0 right-0 z-10 flex items-center justify-between px-6 lg:px-10">
        <button
          type="button"
          onClick={prev}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-white/25"
          aria-label="Slide anterior"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={next}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-white/25"
          aria-label="Slide siguiente"
        >
          ›
        </button>
      </div>

      <div className="absolute bottom-5 left-0 right-0 z-10 flex items-center justify-center gap-2">
        {preparedSlides.map((slide, idx) => (
          <button
            type="button"
            key={`${slide.title}-${idx}-dot`}
            onClick={() => goTo(idx)}
            className={`h-2.5 w-2.5 rounded-full transition ${
              idx === index ? "bg-white" : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Ir al slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
