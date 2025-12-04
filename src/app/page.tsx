import Image from "next/image";
import HeroSlider from "./components/hero-slider";
import PropertySearch from "./components/property-search";
import TestimonialsSection from "./components/testimonials-section";
import ContactModal from "./components/contact-modal";
import ChatWidget from "./components/chat-widget";
import { mapRemoteResultToProperty, type Property, type RemoteResult } from "../lib/properties";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  meta: string;
};

const signatureProperties: Property[] = [
  {
    title: "Residencia Boutique en Equipetrol",
    location: "Equipetrol Norte, Santa Cruz",
    price: "US$ 685,000",
    features: [
      "445 m² integrados",
      "3 suites + estudio",
      "Domótica y piscina climatizada",
    ],
    badge: "Nueva en cartera",
    highlight: "Lista para mudarte",
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Penthouse Panorámico Urubó Golf",
    location: "Urubó Golf, Santa Cruz",
    price: "US$ 890,000",
    features: [
      "520 m² + terraza 180°",
      "4 suites, ascensor privado",
      "Amenidades resort & concierge",
    ],
    badge: "Exclusiva",
    highlight: "Vista a la ciudad",
    image:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Casa Jardín en Colinas del Urubó",
    location: "Colinas del Urubó, Santa Cruz",
    price: "US$ 1,150,000",
    features: [
      "760 m² de terreno",
      "5 suites + family lounge",
      "Jardines maduros y acabados europeos",
    ],
    badge: "Top pick",
    highlight: "Privacidad absoluta",
    image:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1400&q=80",
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      "Cerramos la venta en 27 días con precio récord para la zona. Sentimos que alguien defendía nuestra propiedad como si fuera suya.",
    name: "Mariana Rocabado",
    role: "Propietaria • Equipetrol",
    meta: "Venta full ask + sin contingencias",
  },
  {
    quote:
      "Filtró visitas, negoció cada término y respetó nuestros tiempos familiares. Fue una experiencia boutique, cercana y sin fricción.",
    name: "Diego Flores",
    role: "Gerente General",
    meta: "Compra y venta coordinadas",
  },
  {
    quote:
      "Acceso a oportunidades off-market y números claros. Siento que tengo una aliada en Santa Cruz, no solo una agente.",
    name: "Ana Claudia Méndez",
    role: "Inversionista",
    meta: "Portfolio residencial + land banking",
  },
  {
    quote:
      "Nos ayudó a definir el precio correcto sin presionarnos. La comunicación fue directa, honesta y siempre disponible por WhatsApp.",
    name: "Familia Suárez",
    role: "Vendedores • Zona Norte",
    meta: "Tasación + venta en menos de 45 días",
  },
  {
    quote:
      "Veníamos de una mala experiencia con otra inmobiliaria. Con Paula entendimos el plan, vimos resultados y volvimos a confiar.",
    name: "Marcelo & Lucía",
    role: "Propietarios • Urubó",
    meta: "Cambio de estrategia + nueva puesta en escena",
  },
  {
    quote:
      "Soy de otro país y no conocía Santa Cruz. Paula nos guió barrio por barrio, con videos, recorridos virtuales y visitas filtradas.",
    name: "Carla P.",
    role: "Compradora internacional",
    meta: "Reubicación corporativa • Equipetrol",
  },
  {
    quote:
      "Atención boutique de verdad: pocos clientes, mucha dedicación. Sentimos acompañamiento real desde la tasación hasta la firma.",
    name: "Familia Ríos",
    role: "Propietarios • Condominio privado",
    meta: "Plan de marketing completo + home staging",
  },
  {
    quote:
      "Nos explicó cada documento y cada cláusula. Nunca sentimos que nos estaban apurando a decidir; eso genera mucha confianza.",
    name: "Patricia y Miguel",
    role: "Compradores • Las Palmas",
    meta: "Compra segura para primera vivienda",
  },
  {
    quote:
      "Valoré la paciencia para mostrarme solo lo que tenía sentido para mi presupuesto y estilo de vida. Nada de visitas por cumplir.",
    name: "Gabriela C.",
    role: "Compradora • Zona Norte",
    meta: "Curaduría de shortlist + tours privados",
  },
  {
    quote:
      "Nos ayudó a reordenar la casa, mejorar detalles y entrar a publicación con fotos que parecían de revista. Eso atrajo al comprador correcto.",
    name: "Andrea & Rodrigo",
    role: "Propietarios • Urbarí",
    meta: "Home staging + producción visual",
  },
  {
    quote:
      "Siempre supimos qué estaba pasando: visitas, comentarios de compradores y próximos pasos. La transparencia eliminó el estrés.",
    name: "Juan Pablo V.",
    role: "Inversionista • Santa Cruz",
    meta: "Venta de departamento + reinversión",
  },
  {
    quote:
      "Confío en Paula porque habla claro. Si algo no es para mí, me lo dice. Esa sinceridad es raro encontrarla en el mercado.",
    name: "Laura Gutiérrez",
    role: "Compradora e inversionista",
    meta: "Relación de largo plazo • Atención boutique",
  },
];

const stats = [
  { value: "24h", label: "Rapidez real", detail: "Tasación, pricing y plan de marketing en un día hábil." },
  { value: "Visitas filtradas", label: "Eficiencia", detail: "Solo compradores listos; agenda corta y enfocada." },
  { value: "Negociación senior", label: "Profesionalismo", detail: "Contratos, timings y cierres explicados sin rodeos." },
  { value: "Acompañamiento 1:1", label: "Asesoría premium", detail: "Trato directo con Paula de inicio a firma." },
];

async function fetchRemoteProperties(limit = 6): Promise<Property[]> {
  try {
    const res = await fetch("https://c21.com.bo/v/resultados?json=true", {
      headers: {
        "user-agent": "Mozilla/5.0",
        accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    const data = await res.json();
    const results: RemoteResult[] = Array.isArray(data?.results)
      ? (data.results.slice(0, limit) as RemoteResult[])
      : [];

    return results.map(mapRemoteResultToProperty);
  } catch (error) {
    console.error("No se pudo sincronizar propiedades C21", error);
    return [];
  }
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-3xl space-y-3">
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        {eyebrow}
      </div>
      <h2 className="text-3xl font-semibold leading-tight text-[var(--ink)] md:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">
        <span className="font-[var(--font-display)]">{title}</span>
      </h2>
      {subtitle ? (
        <p className="text-lg text-[var(--muted)] md:text-xl">{subtitle}</p>
      ) : null}
    </div>
  );
}

export default async function Home() {
  const remoteProperties = await fetchRemoteProperties(6);
  const quickProperties = remoteProperties.length ? remoteProperties : signatureProperties;
  const heroSlides = [
    {
      title: "Equipetrol & Zona Norte",
      description:
        "Departamentos y oficinas de alto nivel en Equipetrol, Urbarí y Zona Norte. Producción tipo video y tours privados.",
      ctaLabel: "Ver inmuebles",
      ctaHref: "#propiedades",
      secondary: "Paula Guerra • Century 21 Santa Cruz",
      image:
        "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=2000&q=80",
    },
    {
      title: "Urubó & condominios privados",
      description:
        "Casas con jardín, golf y vista al río en Urubó y Colinas. Fotografías y videos elegantes para un mercado selecto.",
      ctaLabel: "Ver casas en Urubó",
      ctaHref: "#propiedades",
      secondary: "Casas boutique, club house y amenities de resort.",
      image:
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=2000&q=80",
    },
    {
      title: "Santa Cruz • lujo & inversión",
      description:
        "Venta, alquiler e inversión en propiedades premium de Santa Cruz. Tasación, pricing y publicación inmediata.",
      ctaLabel: "Agenda una llamada",
      ctaHref: "#contacto",
      secondary: "Santa Cruz • Buyers internacionales",
      image:
        "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=2000&q=80",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="hero-gridlines" />
        <div className="hero-aurora hero-aurora-1" />
        <div className="hero-aurora hero-aurora-2" />
        <div className="hero-aurora hero-aurora-3" />
        <div className="grain-overlay" />
      </div>

      <header className="fixed top-0 z-30 w-full border-b border-[#d9b05a]/35 bg-[#0f0d0a]/92 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d9b05a]/60 bg-[#1a1713] text-xs font-semibold tracking-[0.2em] text-[#d9b05a]">
              C21
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Century 21 Bolivia</p>
              <p className="text-sm font-semibold text-white">Paula Guerra • Santa Cruz</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-white/75 md:flex">
            <a className="border-b border-transparent pb-1 transition hover:border-[#d9b05a] hover:text-white" href="#propiedades">
              Ver inmuebles
            </a>
            <a className="border-b border-transparent pb-1 transition hover:border-[#d9b05a] hover:text-white" href="#boutique">
              Boutique
            </a>
            <a className="border-b border-transparent pb-1 transition hover:border-[#d9b05a] hover:text-white" href="#venta">
              Venta
            </a>
            <a className="border-b border-transparent pb-1 transition hover:border-[#d9b05a] hover:text-white" href="#contacto">
              Contacto
            </a>
          </nav>
          <a
            href="#contacto"
            className="hidden items-center gap-2 rounded-full border border-[#d9b05a]/70 bg-[#d9b05a] px-4 py-2 text-xs font-semibold text-[#1a1713] shadow-[0_16px_60px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(0,0,0,0.34)] md:inline-flex"
          >
            Agendar con Paula
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </header>

      <div className="pt-24">
        <section className="relative -mx-[calc((100vw-100%)/2)] mb-16 w-screen">
          <HeroSlider slides={heroSlides} />
        </section>
      </div>

      <ChatWidget />

      <main className="mx-auto max-w-6xl px-6 pb-20 lg:px-10">

        <section
          id="boutique"
          className="relative mb-20 overflow-hidden px-4 py-16 sm:px-6 lg:px-10"
        >
          <div className="relative mx-auto max-w-6xl space-y-12">
            <div className="space-y-4 text-center">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                Atención boutique • Century 21 Santa Cruz
              </p>
              <h2 className="text-3xl font-semibold uppercase leading-tight text-[var(--ink)] md:text-4xl">
                Boutique inmobiliaria
              </h2>
              <div className="mx-auto h-px w-16 bg-[var(--muted)]/40" />
            </div>

            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div className="space-y-10">
                <div className="relative w-[78%] max-w-xl">
                  <div className="relative aspect-[4/3] overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.18)] depth-photo">
                    <Image
                      src="https://bepremiumrealestate.net/wp-content/uploads/2025/04/be-premium_inmuebles_lujo_alquiler_venta_retail_luxury_reformas_interiorismo_apartment_design_madrid_barcelona_ibiza_formentera_salon_2-scaled.jpg"
                      alt="Sala luminosa"
                      fill
                      sizes="(min-width: 1024px) 600px, 100vw"
                      className="object-cover"
                      unoptimized
                      priority
                    />
                  </div>
                </div>
                <div className="relative mt-[-120px] ml-[18%] w-[82%] max-w-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.18)] depth-photo">
                    <Image
                      src="https://bepremiumrealestate.net/wp-content/uploads/2025/04/be-premium_inmuebles_lujo_alquiler_venta_retail_luxury_reformas_interiorismo_apartment_design_madrid_barcelona_ibiza_formentera_salon.jpg"
                      alt="Detalle living"
                      fill
                      sizes="(min-width: 1024px) 760px, 100vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5 text-[var(--muted)] lg:pl-4">
                <p className="text-lg leading-relaxed text-[var(--ink)]">
                  Paula Guerra, agente de Century 21 Santa Cruz, lidera una práctica boutique enfocada en propiedades de
                  lujo y land banking. Producción fotográfica, home staging y tours privados para vender o comprar sin
                  visitas masivas.
                </p>
                <p>
                  Comunicación directa, pricing en 24 horas y negociación senior. Trabajamos con propietarios y
                  compradores exigentes en Santa Cruz y con perfiles internacionales listos para invertir.
                </p>
                <div className="flex flex-wrap gap-3 pt-1 text-sm">
                  <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-[var(--muted)]">
                    Home staging + producción
                  </span>
                  <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-[var(--muted)]">
                    Tours privados
                  </span>
                  <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-[var(--muted)]">
                    Pricing en 24h
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="propiedades"
          className="mb-20 rounded-[26px] border border-[var(--line)] bg-white/90 p-8 shadow-[var(--shadow)]"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <SectionHeading
              eyebrow="Propiedades destacadas"
              title="Inmuebles principales en Santa Cruz."
              subtitle="Datos en vivo y propiedades curadas. Ajusta filtros y agenda tours privados."
            />
            <div className="flex flex-wrap gap-2 text-sm text-[var(--muted)]">
              <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2">Santa Cruz</span>
              <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2">Exclusivas</span>
              <span className="rounded-full border border-[var(--line)] bg-white px-4 py-2">Tours privados</span>
            </div>
          </div>
          <PropertySearch initial={quickProperties} />
        </section>

        <section
          id="venta"
          className="relative -mx-[calc((100vw-100%)/2)] mb-0 w-screen overflow-hidden bg-black"
        >
          <Image
            src="https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=2000&q=80"
            alt="Venta de lujo"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#0b0a07]/70" />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-10">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.24em] text-white/70">Venta</p>
              <a
                href="#propiedades"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#1a1713] shadow-[0_16px_50px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5"
              >
                Ver inmuebles en venta
              </a>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
              <div className="space-y-4 text-white">
                <h3 className="text-3xl font-semibold leading-tight md:text-4xl">
                  <span className="font-[var(--font-display)] uppercase">
                    Venta premium, tasación y producción en 24h.
                  </span>
                </h3>
                <p className="text-lg text-white/85">
                  Home staging, pricing estratégico y narrativa comercial. Sin visitas masivas: solo compradores listos.
                </p>
                <div className="grid gap-3 text-sm text-white/85 sm:grid-cols-2 sm:text-base">
                  <p><strong>Localizaciones:</strong> Santa Cruz • Buyers internacionales</p>
                  <p><strong>Atención:</strong> Personalizada, una sola voz</p>
                  <p><strong>Idiomas:</strong> ES / ENG</p>
                  <p><strong>Calidad:</strong> Lujo y land banking</p>
                </div>
              </div>
              <div className="grid gap-4 rounded-[24px] bg-black/45 p-5 text-white backdrop-blur-xl sm:grid-cols-2">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-2xl font-semibold">
                      <span className="stat-glow">{stat.value}</span>
                    </p>
                    <p className="text-xs uppercase tracking-[0.14em] text-white/70">{stat.label}</p>
                    <p className="text-sm text-white/80">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <TestimonialsSection testimonials={testimonials} />

        <section
          id="contacto"
          className="relative -mx-[calc((100vw-100%)/2)] mb-20 w-screen bg-gradient-to-r from-[#f4efe4] via-[#fbf8f2] to-[#f4efe4]"
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-[#e7dccb]/70 blur-[120px]" />
            <div className="absolute right-[-8%] top-1/3 h-96 w-96 rounded-full bg-[#f1e2cf]/70 blur-[160px]" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-16 lg:px-10">
            <div className="space-y-10">
              <div className="space-y-4 text-left max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e1d4c3] bg-white/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                  Contacto • Atención boutique
                </div>
                <h2 className="text-3xl font-semibold leading-tight text-[var(--ink)] md:text-[2.6rem]">
                  <span className="font-[var(--font-display)]">Vamos directo a tu próxima jugada inmobiliaria.</span>
                </h2>
                <p className="text-lg text-[var(--muted)]">
                  Me escribes, reviso tu caso y coordinamos pricing, visita o plan comercial sin esperas ni formularios genéricos.
                </p>
              </div>

              <div className="space-y-4 text-base text-[var(--ink)]">
                <p className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--ink)]/70" aria-hidden="true" />
                  Venta exclusiva de propiedades de alto valor con producción completa y estrategia de lanzamiento.
                </p>
                <p className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--ink)]/70" aria-hidden="true" />
                  Shortlist curado para compradores e inversionistas que necesitan opciones claras en Santa Cruz.
                </p>
                <p className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--ink)]/70" aria-hidden="true" />
                  Land banking y oportunidades off-market con negociación directa.
                </p>
              </div>

              <div className="grid gap-4 rounded-[28px] border border-white/40 bg-white/30 p-2 shadow-[0_20px_70px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:grid-cols-[1.05fr_1fr_0.85fr] lg:items-stretch">
                <a
                  href="https://wa.me/59169040849"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col justify-between rounded-2xl border border-[#d7c6a6]/60 bg-gradient-to-br from-[#14100c] via-[#0f0d0a] to-[#1b160f] p-6 text-white shadow-[0_22px_70px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_30px_90px_rgba(0,0,0,0.38)]"
                >
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/65">WhatsApp directo</div>
                  <p className="text-2xl font-semibold text-[#d9b05a]">+591 690 408 49</p>
                  <p className="text-sm text-white/80">Respondo personalmente.</p>
                </a>
                <div className="rounded-2xl border border-[var(--line)] bg-white/96 p-6 text-sm text-[var(--muted)] shadow-[0_18px_60px_rgba(23,18,10,0.08)]">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">Email & oficina</p>
                  <p className="text-base font-semibold text-[var(--ink)]">paula.guerra@century21.bo</p>
                  <p>Calle Jaimes Freire - Of 1 A., Equipetrol</p>
                  <p>Santa Cruz • C.P.</p>
                </div>
                <div className="relative h-[220px] w-full overflow-hidden rounded-[22px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_26px_90px_rgba(23,18,10,0.22)] sm:h-[260px] lg:h-[280px]">
                  <Image
                    src="/p25.svg"
                    alt="Paula Guerra, asesora inmobiliaria"
                    fill
                    sizes="(min-width: 1024px) 230px, 50vw"
                    className="object-cover object-top"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0d0a]/45 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 space-y-1 text-white">
                    <p className="text-sm font-semibold">Paula Guerra</p>
                    <p className="text-[12px] text-white/80">Century 21 Santa Cruz</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <ContactModal />
                <p className="hidden text-sm text-[var(--muted)] sm:block sm:text-right">
                  Agenda selecta. Te respondo en menos de 24h por WhatsApp o correo.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#d9b05a]/35 bg-[#0f0d0a] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1.1fr_1fr_1fr] lg:px-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d9b05a]/50 bg-[#1a1713] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#d9b05a]">
              Century 21 Bolivia
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold text-white">Paula Guerra</p>
              <p className="text-sm text-white/70">Asesora inmobiliaria • Century 21 Santa Cruz</p>
            </div>
            <p className="text-sm text-white/70">
              Estrategia, marketing y negociación de propiedades de alto valor y land banking en Santa Cruz y Bolivia.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="rounded-full border border-[#d9b05a]/40 bg-[#1a1713] px-3 py-2">Luxury & Residencial</span>
              <span className="rounded-full border border-[#d9b05a]/40 bg-[#1a1713] px-3 py-2">Inversión & land banking</span>
              <span className="rounded-full border border-[#d9b05a]/40 bg-[#1a1713] px-3 py-2">Santa Cruz • Bolivia</span>
            </div>
          </div>

          <div className="space-y-4 text-sm text-white/70">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#d9b05a]">Navegación</p>
            <div className="grid grid-cols-2 gap-2">
              <a className="border-b border-transparent pb-1 transition hover:border-[#d9b05a] hover:text-white" href="#propiedades">
                Propiedades
              </a>
              <a className="border-b border-transparent pb-1 transition hover:border-[#d9b05a] hover:text-white" href="#testimonios">
                Testimonios
              </a>
              <a className="border-b border-transparent pb-1 transition hover:border-[#d9b05a] hover:text-white" href="#contacto">
                Contacto
              </a>
              <a className="border-b border-transparent pb-1 transition hover:border-[#d9b05a] hover:text-white" href="#venta">
                Metodología de venta
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#d9b05a]">Contacto directo</p>
              <p className="flex items-center gap-2 text-sm text-white">
                <svg aria-hidden="true" className="h-4 w-4 text-[#d9b05a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6.62 10.79a15.91 15.91 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.1.37 2.29.56 3.58.56a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C11.85 21 3 12.15 3 2a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.29.19 2.48.56 3.58a1 1 0 0 1-.24 1.01l-2.2 2.2Z" />
                </svg>
                +591 690 408 49
              </p>
              <p className="flex items-center gap-2 text-sm text-white">
                <svg aria-hidden="true" className="h-4 w-4 text-[#d9b05a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16v16H4z" />
                  <path d="m4 7 8 6 8-6" />
                </svg>
                paula.guerra@century21.bo
              </p>
              <p className="flex items-center gap-2 text-sm text-white/80">
                <svg aria-hidden="true" className="h-4 w-4 text-[#d9b05a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3 15 5v16l-6-2-6 2V5z" />
                  <path d="m9 3 6 2" />
                </svg>
                Oficina: Calle Jaimes Freire - Of 1 A., Equipetrol, C.P., Santa Cruz
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#d9b05a]">Agenda una llamada</p>
            <p className="text-sm text-white/75">
              Definimos pricing, plan de marketing y próximos pasos en 20 minutos.
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="#contacto"
                className="inline-flex items-center justify-center rounded-full bg-[#d9b05a] px-4 py-3 text-sm font-semibold text-[#1a1713] shadow-[0_14px_60px_rgba(0,0,0,0.32)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(0,0,0,0.38)]"
              >
                Agendar con Paula
              </a>
              <a
                href="https://c21.com.bo/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-[#d9b05a]/50 bg-[#1a1713] px-4 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#d9b05a]"
              >
                Conoce Century 21 Bolivia
              </a>
            </div>
            <p className="text-[11px] text-white/60">
              Design & Develop by {" "}
              <a
                href="https://www.altiusignite.com"
                target="_blank"
                rel="noreferrer"
                className="border-b border-transparent text-white transition hover:border-[#d9b05a] hover:text-[#d9b05a]"
              >
                Altius Ignite
              </a>
              .
            </p>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <a
          href="#propiedades"
          className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-3 text-xs font-semibold text-[var(--ink)] shadow-[0_12px_40px_rgba(23,18,10,0.12)] transition hover:-translate-y-0.5"
        >
          ● Ver inmuebles
        </a>
        <a
                href="https://wa.me/59169040849"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full bg-[var(--accent-green)] px-4 py-3 text-xs font-semibold text-white shadow-[0_14px_40px_rgba(11,143,63,0.35)] transition hover:-translate-y-0.5"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
