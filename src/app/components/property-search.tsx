"use client";

import { type FormEvent, useState } from "react";
import type { Property } from "../../lib/properties";
import PropertyGrid from "./property-grid";

export default function PropertySearch({ initial }: { initial: Property[] }) {
  const PAGE_SIZE = 12;
  const [query, setQuery] = useState("");
  const [properties, setProperties] = useState<Property[]>(initial);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSearch, setLastSearch] = useState<string>("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalResults, setTotalResults] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedOperation, setSelectedOperation] = useState("");
  const [selectedBeds, setSelectedBeds] = useState("");
  const [selectedBaths, setSelectedBaths] = useState("");
  const [selectedScope, setSelectedScope] = useState<"sc" | "bo">("sc");

  const quickFilters = ["Equipetrol", "Urubó", "Las Palmas", "Casa", "Departamento", "Terreno"];
  const typeOptions = [
    { value: "", label: "Tipo de propiedad" },
    { value: "casa", label: "Casa" },
    { value: "casa-en-condominio", label: "Casa en condominio" },
    { value: "departamento", label: "Departamento" },
    { value: "penthouse", label: "Penthouse" },
    { value: "terreno", label: "Terreno / lote" },
    { value: "oficinas", label: "Oficina" },
    { value: "local-comercial", label: "Local comercial" },
  ];

  const operationOptions = [
    { value: "", label: "Venta o alquiler" },
    { value: "venta", label: "Solo venta" },
    { value: "renta", label: "Solo alquiler" },
  ];

  const bedsOptions = [
    { value: "", label: "Dormitorios" },
    { value: "1", label: "1+ dorms" },
    { value: "2", label: "2+ dorms" },
    { value: "3", label: "3+ dorms" },
    { value: "4", label: "4+ dorms" },
    { value: "5", label: "5+ dorms" },
  ];

  const bathsOptions = [
    { value: "", label: "Baños" },
    { value: "1", label: "1+ baños" },
    { value: "2", label: "2+ baños" },
    { value: "3", label: "3+ baños" },
    { value: "4", label: "4+ baños" },
    { value: "5", label: "5+ baños" },
  ];

  const scopeOptions = [
    { value: "sc", label: "Santa Cruz" },
    { value: "bo", label: "Todo Bolivia" },
  ];
  const quickTypeMap: Record<string, string> = {
    Casa: "casa",
    Departamento: "departamento",
    Terreno: "terreno",
  };

  type SearchParams = {
    text?: string;
    type?: string;
    zone?: string;
    operation?: string;
    beds?: string;
    baths?: string;
    scope?: "sc" | "bo";
    page?: number;
    append?: boolean;
  };

  const runSearch = async ({
    text = query,
    type = selectedType,
    zone = selectedZone,
    operation = selectedOperation,
    beds = selectedBeds,
    baths = selectedBaths,
    scope = selectedScope,
    page: requestedPage,
    append = false,
  }: SearchParams = {}) => {
    const keyword = [zone, text].filter(Boolean).join(" ").trim();
    const hasFilters =
      keyword || type || operation || beds || baths || scope !== "sc" || selectedZone || selectedType;
    if (!hasFilters) {
      setProperties(initial);
      setStatus("Explora las propiedades curadas para ti.");
      setError(null);
      setLastSearch("");
      setPage(1);
      setHasMore(false);
      setTotalResults(initial.length);
      return;
    }

    const nextPage = append ? requestedPage || page + 1 : requestedPage || 1;

    setLoading(true);
    setError(null);
    setStatus(append ? "Cargando página siguiente..." : "Buscando en el inventario completo de Paula...");

    try {
      const params = new URLSearchParams();
      if (keyword) params.set("q", keyword);
      if (type) params.set("type", type);
      if (operation) params.set("operation", operation);
      if (beds) params.set("beds", beds);
      if (baths) params.set("baths", baths);
      if (scope) params.set("scope", scope);
      params.set("page", String(nextPage));
      params.set("limit", String(PAGE_SIZE));

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data?.error) {
        setError("No se pudo conectar al buscador. Mostrando destacados.");
        setStatus("Revisa tu conexión o intenta otro término.");
        setProperties(initial);
        setLastSearch("");
        setHasMore(false);
        setPage(1);
        setTotalResults(initial.length);
        return;
      }

      const results = Array.isArray(data?.properties) ? (data.properties as Property[]) : [];
      const total =
        typeof data?.total === "number"
          ? data.total
          : Number(data?.total) || (append ? properties.length + results.length : results.length);
      const nextList = append ? [...properties, ...results] : results;

      setProperties(nextList);
      setPage(nextPage);
      setHasMore(Boolean(data?.hasMore));
      setTotalResults(total);
      setLastSearch(keyword || "");
      const readableFilters = [
        operation === "venta" ? "Venta" : operation === "renta" ? "Alquiler" : null,
        typeOptions.find((t) => t.value === type)?.label || null,
        beds ? `${beds}+ dorms` : null,
        baths ? `${baths}+ baños` : null,
        zone || null,
        scope === "bo" ? "Bolivia" : "Santa Cruz",
      ].filter(Boolean);
      const filtersText = readableFilters.length ? ` (${readableFilters.join(" • ")})` : "";
      setStatus(
        nextList.length
          ? `Mostrando ${nextList.length}${total ? ` de ${total}` : ""} resultados${filtersText}`
          : `Sin coincidencias. Ajusta zona, tipo, operación o dormitorios.`,
      );
    } catch (err) {
      console.error(err);
      setError("No se pudo ejecutar la búsqueda. Intenta nuevamente.");
      setStatus("Mostrando los listados iniciales.");
      setProperties(initial);
      setLastSearch("");
      setHasMore(false);
      setPage(1);
      setTotalResults(initial.length);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch({ text: query });
  };

  const handleQuick = (value: string) => {
    let nextType = selectedType;
    let nextZone = selectedZone;
    if (quickTypeMap[value]) {
      nextType = quickTypeMap[value];
      setSelectedType(nextType);
    } else {
      nextZone = value;
      setSelectedZone(nextZone);
    }
    setQuery(value);
    runSearch({ text: value, type: nextType, zone: nextZone });
  };

  return (
    <div className="mt-10 space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-[22px] border border-[var(--line)] bg-[var(--surface)]/90 p-6 shadow-[var(--shadow)] backdrop-blur-sm"
      >
        <div className="flex flex-col gap-3 rounded-[18px] border border-[var(--line)] bg-white/70 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">Buscador activo</p>
            <p className="text-sm text-[var(--ink)]">
              Filtra por operación, tipo, zona y dormitorios. Tours privados con Paula.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <span className="h-2 w-2 rounded-full bg-[var(--gold)] animate-[pulseDot_2s_ease_infinite]" />
            <span>Datos en vivo de Century 21 Bolivia</span>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-6 md:items-end">
          <div className="md:col-span-2">
            <label className="text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Busca propiedades
            </label>
            <div className="mt-2 flex items-center gap-2 rounded-[14px] border border-[var(--line)] bg-white px-3 py-2 shadow-sm focus-within:border-[var(--gold)] focus-within:shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
              <span className="text-[var(--gold)] opacity-90">🔍</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ej. Equipetrol, Urubó, casa 4 dorms"
                className="w-full bg-transparent text-sm text-[var(--ink)] placeholder:text-[var(--muted)]/70 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="sr-only">Operación</label>
            <select
              value={selectedOperation}
              onChange={(e) => {
                const next = e.target.value;
                setSelectedOperation(next);
                runSearch({ operation: next });
              }}
              className="w-full rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-none"
            >
              {operationOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-white text-[var(--ink)]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="sr-only">Tipo</label>
            <select
              value={selectedType}
              onChange={(e) => {
                const next = e.target.value;
                setSelectedType(next);
                runSearch({ type: next });
              }}
              className="w-full rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-none"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-white text-[var(--ink)]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="sr-only">Dormitorios</label>
            <select
              value={selectedBeds}
              onChange={(e) => {
                const next = e.target.value;
                setSelectedBeds(next);
                runSearch({ beds: next });
              }}
              className="w-full rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-none"
            >
              {bedsOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-white text-[var(--ink)]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="sr-only">Baños</label>
            <select
              value={selectedBaths}
              onChange={(e) => {
                const next = e.target.value;
                setSelectedBaths(next);
                runSearch({ baths: next });
              }}
              className="w-full rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-none"
            >
              {bathsOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-white text-[var(--ink)]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div className="flex flex-wrap gap-2">
            <label className="sr-only">Zona</label>
            <select
              value={selectedZone}
              onChange={(e) => {
                const next = e.target.value;
                setSelectedZone(next);
                runSearch({ zone: next });
              }}
              className="w-full rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-none md:w-60"
            >
              {["", "Equipetrol", "Urubó", "Las Palmas", "Zona Norte", "Zona Sur", "Centro"].map((value) => (
                <option key={value} value={value} className="bg-white text-[var(--ink)]">
                  {value || "Zona / barrio"}
                </option>
              ))}
            </select>
            <select
              value={selectedScope}
              onChange={(e) => {
                const next = e.target.value as "sc" | "bo";
                setSelectedScope(next);
                runSearch({ scope: next });
              }}
              className="w-full rounded-[14px] border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] focus:border-[var(--gold)] focus:outline-none md:w-48"
            >
              {scopeOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-white text-[var(--ink)]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--ink)] shadow-[0_16px_50px_rgba(23,18,10,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(23,18,10,0.18)]"
              disabled={loading}
            >
              {loading ? "Buscando..." : "Buscar propiedades"}
            </button>
            <button
              type="button"
              className="rounded-full border border-[var(--line)] bg-white px-4 py-3 text-xs font-semibold text-[var(--muted)] transition hover:-translate-y-0.5 hover:border-[var(--gold)] hover:text-[var(--ink)]"
              onClick={() => {
                setSelectedType("");
                setSelectedZone("");
                setSelectedOperation("");
                setSelectedBeds("");
                setSelectedBaths("");
                setSelectedScope("sc");
                setQuery("");
                setPage(1);
                setHasMore(false);
                setTotalResults(initial.length);
                runSearch({
                  text: "",
                  type: "",
                  zone: "",
                  operation: "",
                  beds: "",
                  baths: "",
                  scope: "sc",
                });
              }}
              disabled={loading}
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        {quickFilters.map((item) => (
          <button
            key={item}
            type="button"
            className="rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-xs font-semibold text-[var(--muted)] transition hover:-translate-y-0.5 hover:border-[var(--gold)] hover:text-[var(--ink)]"
            onClick={() => handleQuick(item)}
            disabled={loading}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--gold)]" />
            Sincronizando inventario en vivo...
          </span>
        ) : (
          <span>{status || "Explora propiedades en tiempo real."}</span>
        )}
        {lastSearch ? (
          <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
            Texto: {lastSearch}
          </span>
        ) : null}
        {selectedOperation ? (
          <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
            {selectedOperation === "venta" ? "Venta" : "Alquiler"}
          </span>
        ) : null}
        {selectedType ? (
          <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
            Tipo: {selectedType}
          </span>
        ) : null}
        {selectedZone ? (
          <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
            Zona: {selectedZone}
          </span>
        ) : null}
        {selectedBeds ? (
          <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
            Dorms: {selectedBeds}+
          </span>
        ) : null}
        {selectedBaths ? (
          <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
            Baños: {selectedBaths}+
          </span>
        ) : null}
        <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
          Alcance: {selectedScope === "bo" ? "Bolivia" : "Santa Cruz"}
        </span>
        {error ? (
          <span className="rounded-full border border-red-500/30 bg-red-50 px-3 py-1 text-xs text-red-700">
            {error}
          </span>
        ) : null}
      </div>

      {!properties.length && !loading ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white/90 p-5 text-sm text-[var(--muted)]">
          Sin resultados. Prueba con otra zona, tipo de propiedad o código de listado.
        </div>
      ) : null}

      <PropertyGrid properties={properties} />

      <div className="flex flex-col items-center justify-center gap-2 pt-6">
        {hasMore ? (
          <button
            type="button"
            onClick={() => runSearch({ append: true, page: page + 1 })}
            className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-xs font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--gold)] hover:text-[var(--ink)] disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Siguiente página"}
          </button>
        ) : null}
        {properties.length ? (
          <p className="text-xs text-[var(--muted)]">
            Página {page} • Mostrando {properties.length}
            {totalResults ? ` de ${totalResults}` : ""} listados
          </p>
        ) : null}
      </div>
    </div>
  );
}
