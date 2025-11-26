"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function ContactModal() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      window.addEventListener("keydown", onKey);
    }
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-flex items-center gap-3 rounded-xl border border-[#d7c6a6]/70 bg-[var(--ink)] px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(23,18,10,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(23,18,10,0.35)]"
      >
        Programar llamada con Paula
        <span className="text-lg transition group-hover:translate-x-0.5" aria-hidden="true">
          →
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0906]/70 backdrop-blur-sm" onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-[94vw] max-w-4xl overflow-hidden rounded-[32px] border border-[#d7c6a6]/30 bg-gradient-to-br from-[#0f0d0a]/96 via-[#17130f]/94 to-[#0f0d0a]/96 shadow-[0_42px_150px_rgba(0,0,0,0.6)] backdrop-blur-2xl"
            onClick={(e) => e.stopPropagation()}
            ref={dialogRef}
          >
            <div className="absolute inset-0 pointer-events-none opacity-60">
              <div className="absolute -left-10 top-6 h-72 w-72 rounded-full bg-[#d4b06a]/16 blur-[120px]" />
              <div className="absolute right-[-8%] top-1/3 h-80 w-80 rounded-full bg-white/10 blur-[140px]" />
            </div>
            <button
              type="button"
              onClick={close}
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-sm transition hover:scale-105"
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="relative grid gap-10 p-8 lg:grid-cols-[1.2fr_0.9fr] lg:p-10">
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#d9b05a]">Agenda una llamada</p>
                  <h3 className="text-2xl font-semibold text-white">Cuéntame de tu propiedad o búsqueda.</h3>
                  <p className="text-sm text-white/75">
                    Respuesta en menos de 24h vía WhatsApp o correo. Sin visitas masivas; solo compradores listos.
                  </p>
                </div>
                <form className="grid gap-4 text-[var(--muted)]">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1.5 text-sm text-white/80">
                      <span>Nombre completo</span>
                      <input
                        type="text"
                        name="nombre"
                        placeholder="Ej. Paula Guerra"
                        className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3.5 text-white placeholder:text-white/60 focus:border-[#d9b05a] focus:outline-none"
                        required
                      />
                    </label>
                    <label className="space-y-1.5 text-sm text-white/80">
                      <span>Teléfono / WhatsApp</span>
                      <input
                        type="tel"
                        name="telefono"
                        placeholder="+591 ..."
                        className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3.5 text-white placeholder:text-white/60 focus:border-[#d9b05a] focus:outline-none"
                        required
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1.5 text-sm text-white/80">
                      <span>Correo electrónico</span>
                      <input
                        type="email"
                        name="email"
                        placeholder="nombre@correo.com"
                        className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3.5 text-white placeholder:text-white/60 focus:border-[#d9b05a] focus:outline-none"
                        required
                      />
                    </label>
                    <label className="space-y-1.5 text-sm text-white/80">
                      <span>Tipo de propiedad</span>
                      <select
                        name="tipo"
                        className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3.5 text-white focus:border-[#d9b05a] focus:outline-none"
                        defaultValue="venta"
                      >
                        <option value="venta" className="bg-[#0f0d0a] text-white">
                          Venta de propiedad
                        </option>
                        <option value="compra" className="bg-[#0f0d0a] text-white">
                          Búsqueda para compra
                        </option>
                        <option value="inversion" className="bg-[#0f0d0a] text-white">
                          Land banking / inversión
                        </option>
                        <option value="consulta" className="bg-[#0f0d0a] text-white">
                          Consulta general
                        </option>
                      </select>
                    </label>
                  </div>
                  <label className="space-y-1.5 text-sm text-white/80">
                    <span>Cuéntame más</span>
                    <textarea
                      name="mensaje"
                      rows={4}
                      placeholder="Zona, tiempos y cualquier detalle clave."
                      className="w-full rounded-2xl border border-white/15 bg-white/8 px-4 py-3.5 text-white placeholder:text-white/60 focus:border-[#d9b05a] focus:outline-none"
                    />
                  </label>
                  <button
                    type="submit"
                    className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d9b05a] via-[#f1d9a0] to-[#c29534] px-6 py-4 text-sm font-semibold text-[#1a1208] shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_32px_90px_rgba(0,0,0,0.32)]"
                  >
                    Enviar a Paula
                  </button>
                  <p className="flex items-center gap-2 text-[12px] text-white/70">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/75" aria-hidden="true" />
                    Privacidad garantizada y respuesta en menos de 24 horas hábiles.
                  </p>
                </form>
              </div>
              <div className="relative flex items-end justify-center lg:justify-end">
                <div className="relative h-[240px] w-[170px] overflow-hidden rounded-[26px] border border-white/35 bg-white/10 shadow-[0_32px_90px_rgba(0,0,0,0.35)] sm:h-[280px] sm:w-[200px] lg:h-[320px] lg:w-[230px]">
                  <Image
                    src="/p25.svg"
                    alt="Paula Guerra, asesora inmobiliaria"
                    fill
                    sizes="(min-width: 1024px) 230px, 60vw"
                    className="object-cover object-top"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
