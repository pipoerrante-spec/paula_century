"use client";

import { useEffect, useRef, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  meta: string;
};

const VIDEO_SOURCES = ["/100.mp4", "/101.mp4"];

export default function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const [videoIndex, setVideoIndex] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const play = async () => {
      try {
        await video.play();
      } catch {
        // ignore autoplay errors
      }
    };
    play();
  }, [videoIndex]);

  const handleEnded = () => {
    setVideoIndex((prev) => (prev + 1) % VIDEO_SOURCES.length);
  };

  useEffect(() => {
    if (!testimonials.length) return;
    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 3) % testimonials.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const visible =
    testimonials.length <= 3
      ? testimonials
      : [0, 1, 2].map((offset) => testimonials[(startIndex + offset) % testimonials.length]);

  return (
    <section
      id="testimonios"
      className="relative -mx-[calc((100vw-100%)/2)] mb-20 w-screen overflow-hidden"
    >
      <div className="absolute inset-0">
        <video
          key={videoIndex}
          ref={videoRef}
          className="h-full w-full object-cover"
          src={VIDEO_SOURCES[videoIndex]}
          autoPlay
          muted
          playsInline
          onEnded={handleEnded}
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 lg:px-10">
        <div className="max-w-3xl space-y-4 text-white">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/70">
            Confianza
          </p>
          <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
            <span className="font-[var(--font-display)]">
              Historias reales, cierres seguros.
            </span>
          </h2>
          <p className="text-lg text-white/80">
            Clientes corporativos, familias e inversionistas que eligieron acompañamiento senior y
            un proceso boutique de principio a fin.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/20 bg-white/10 px-5 py-5 text-sm text-white/85 backdrop-blur-xl">
              “Fotografía, puesta en escena y visitas filtradas. Solo compradores listos, sin perder
              tiempo.”
              <p className="mt-3 font-semibold text-[var(--gold)]">
                – Paula Guerra, Century 21
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {visible.map((testimonial) => (
              <div
                key={testimonial.name}
                className="flex h-full flex-col justify-between rounded-[22px] border border-white/18 bg-white/10 p-5 text-white backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/16"
              >
                <p className="text-sm leading-relaxed text-white/90">“{testimonial.quote}”</p>
                <div className="mt-6 space-y-1">
                  <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/70">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-[var(--gold)]">{testimonial.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
