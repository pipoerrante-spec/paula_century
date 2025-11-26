import type { Metadata } from "next";
import Script from "next/script";
import { Montserrat, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const display = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paula Guerra | Century 21 Santa Cruz",
  description:
    "Experta inmobiliaria de Century 21 especializada en propiedades de alto valor y land banking en Santa Cruz.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GTAG_ID;

  return (
    <html lang="es">
      <body
        className={`${body.variable} ${display.variable} antialiased bg-[var(--background)] text-[var(--ink)]`}
      >
        {GA_ID ? (
          <>
            <Script id="gtag-base" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
              `}
            </Script>
            <Script
              id="gtag-config"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`gtag('config', '${GA_ID}', { send_page_view: true });`}
            </Script>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
