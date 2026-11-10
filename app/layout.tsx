import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Self-hosted (not next/font/google): dev and CI shouldn't depend on reaching
// Google Fonts over the network. Each file is the Latin-subset woff2 Google
// itself serves for these families; variable ones cover their full weight range.
const sans = localFont({
  src: "../public/fonts/instrument-sans-variable.woff2",
  weight: "400 700",
  variable: "--font-sans",
  display: "swap",
});

const serif = localFont({
  src: [
    { path: "../public/fonts/instrument-serif-regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/instrument-serif-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-serif",
  display: "swap",
});

const mono = localFont({
  src: "../public/fonts/jetbrains-mono-variable.woff2",
  weight: "400 700",
  variable: "--font-mono",
  display: "swap",
});

const hand = localFont({
  src: "../public/fonts/caveat-variable.woff2",
  weight: "500 700",
  variable: "--font-hand",
  display: "swap",
});

// Switch to https://jaimerabazo.com (and restore public/CNAME) once the domain is set up.
const SITE_URL = "https://jaimerabazo.github.io";

export const metadata: Metadata = {
  title: "Jaime Rabazo — ML, AI & Technology Strategy",
  description:
    "Jaime Rabazo Fernández — Computer Science + Business Administration (UC3M). Built production ML at Telefónica and an AI tender analysis platform at Telefónica Tech.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Jaime Rabazo — ML, AI & Technology Strategy",
    description:
      "Production ML across 52,000+ mobile cells. An AI platform that cut RFP triage from 3 hours to 5 minutes.",
    url: SITE_URL,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} ${mono.variable} ${hand.variable}`}
    >
      <body className="text-ink-900 font-sans antialiased">
        <SmoothScroll />
        <Navbar />
        <main className="relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
