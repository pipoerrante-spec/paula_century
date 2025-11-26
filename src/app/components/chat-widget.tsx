"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hola, soy Atlas, asistente de Paula (Century 21 Bolivia). ¿Buscas compra, venta o alquiler? Cuéntame zona, rango y tiempos para ayudarte.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data?.reply || "" }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "No me pude conectar. Intenta de nuevo en unos segundos." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-full border border-[#d9b05a]/70 bg-[#0f0d0a]/90 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
      >
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#d9b05a] via-[#f1d9a0] to-[#b7821c] text-[#0f0d0a] shadow-[0_0_0_rgba(0,0,0,0.2)]">
          <span className="absolute inset-0 animate-ping rounded-full bg-[#d9b05a]/25" aria-hidden="true" />
          ✦
        </span>
        <span className="pr-1">Habla con mi equipo</span>
        <span className="text-lg transition group-hover:translate-x-0.5" aria-hidden="true">
          →
        </span>
      </button>

      {open ? (
        <div className="fixed bottom-24 left-6 z-50 w-[92vw] max-w-[520px] rounded-[22px] border border-white/15 bg-[rgba(12,10,8,0.7)] text-white shadow-[0_38px_150px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#d9b05a]">Atlas • Equipo de Paula</p>
              <p className="text-sm font-medium text-white">Compra, venta o alquiler en Bolivia</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white hover:border-white/50"
              aria-label="Cerrar chat"
            >
              ×
            </button>
          </div>

          <div className="flex max-h-[78vh] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 text-sm">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl px-3 py-2 whitespace-pre-line leading-relaxed ${
                    m.role === "assistant"
                      ? "bg-white/12 text-white border border-white/10"
                      : "bg-[#d9b05a] text-[#0f0d0a]"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading ? (
                <div className="flex items-center gap-2 rounded-2xl bg-white/6 px-3 py-2 text-white/80">
                  <span className="text-sm">Atlas está escribiendo</span>
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/70" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/70 [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-white/70 [animation-delay:240ms]" />
                  </span>
                </div>
              ) : null}
              <div ref={endRef} />
            </div>

            <div className="space-y-2 border-t border-white/10 px-5 py-4">
              <div className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] text-white/70">
                Sugerencia: comparte zona, rango (USD), tipo (casa/depto), venta o alquiler y WhatsApp para coordinar con Paula.
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Escribe aquí"
                  className="h-11 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 text-sm text-white placeholder:text-white/50 focus:border-[#d9b05a] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#d9b05a] via-[#f1d9a0] to-[#c29534] px-4 text-sm font-semibold text-[#0f0d0a] shadow-[0_14px_40px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {loading ? "Enviando" : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
