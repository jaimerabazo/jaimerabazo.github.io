import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import MotionProvider from "@/components/MotionProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

const hand = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
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

export const viewport: Viewport = {
  themeColor: "#f3efe6",
  colorScheme: "light",
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
        <MotionProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink-900 focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-paper"
          >
            Skip to main content
          </a>
          <SmoothScroll />
          <Navbar />
          <main id="main" tabIndex={-1} className="relative">{children}</main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
