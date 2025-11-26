import type { Metadata } from "next";
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
  return (
    <html lang="es">
      <body
        className={`${body.variable} ${display.variable} antialiased bg-[var(--background)] text-[var(--ink)]`}
      >
        {children}
      </body>
    </html>
  );
}
