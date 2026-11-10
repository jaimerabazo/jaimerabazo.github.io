"use client";

import { motion, useScroll } from "framer-motion";
import { useRef } from "react";
import reading from "@/public/data/reading.json";
import { Hand } from "./Doodles";
import Seat3D from "./Seat3D";

// Goodreads "currently reading" shelf, refreshed at build time by
// scripts/fetch-reading.mjs (and a daily scheduled deploy).
const fmtDay = new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: "Europe/Madrid" });
const fmtMonth = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "Europe/Madrid" });
// "07 SEP": three-letter month, like the boarding pass dates.
const since = (iso: string) => `${fmtDay.format(new Date(iso))} ${fmtMonth.format(new Date(iso)).slice(0, 3)}`;

export default function Reading() {
  const ref = useRef<HTMLElement>(null);
  // The section is tall and its contents stick, so scrolling through it
  // plays the seat: tray unfolds, book lands, camera dives onto the cover.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [book, ...others] = reading.books;
  if (!book) return null;

  return (
    <section ref={ref} aria-label="In-flight reading" className="relative h-[220vh]">
      <div className="sticky top-0 grid h-[100svh] grid-rows-[minmax(0,1fr)_auto] gap-6 pb-10 pt-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-1 lg:items-center lg:gap-12 lg:py-20">
        <div
          className="relative order-2 flex min-w-0 flex-col pl-6 lg:order-1 lg:pl-8"
        >
          {/* navy spine, matching the boarding pass livery */}
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 overflow-hidden rounded-full bg-livery">
            {/* fills gold as you scroll through the scene, so it's clear it's going somewhere */}
            <motion.span
              className="absolute inset-0 origin-top rounded-full bg-livery-gold"
              style={{ scaleY: scrollYProgress }}
            />
          </span>

          <p className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 sm:text-[11px] sm:tracking-[0.2em]">
            In-flight reading <span className="text-livery-gold">●</span> now
          </p>
          <p className="mt-3 font-serif text-[1.6rem] leading-[1.08] text-ink-900 sm:text-[2.2rem]">
            {book.title}
          </p>
          {book.subtitle && (
            <p className="mt-2 line-clamp-2 font-serif text-[15px] italic leading-snug text-ink-600 sm:text-[17px]">{book.subtitle}</p>
          )}
          <p className="mt-3 text-[14px] text-ink-600 sm:text-[15px]">by {book.author}</p>

          <div className="mt-5 flex flex-wrap items-end gap-x-5 gap-y-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">
              Since {since(book.added)} · via Goodreads
            </span>
            {others.length > 0 && (
              <Hand as="span" className="text-[1.1rem]">
                + {others.length} more on the go
              </Hand>
            )}
          </div>
        </div>

        <div className="relative order-1 h-full min-h-0 lg:order-2">
          <Seat3D cover={book.cover} title={book.title} progress={scrollYProgress} />
          <Hand
            as="span"
            mode="time"
            delay={2}
            className="pointer-events-none absolute right-2 top-4 hidden rotate-6 text-[1.2rem] leading-[1.05] sm:block"
          >
            left it here,
            <br />
            back in a sec
          </Hand>
        </div>
      </div>
    </section>
  );
}
