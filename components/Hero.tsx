"use client";

import { motion } from "framer-motion";
import { CSSProperties, useEffect, useState } from "react";
import SplitFlap from "./SplitFlap";
import { ARROW, CIRCLE, Doodle, Hand } from "./Doodles";

const ease = [0.22, 1, 0.36, 1] as const;

function MadridClock() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid",
      hour: "2-digit",
      minute: "2-digit",
    });
    const update = () => setTime(fmt.format(new Date()));
    update();
    const id = setInterval(update, 15000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular">{time ?? "--:--"}</span>;
}

export default function Hero() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const heroSrc = `${basePath}/images/jaime-hero.png`;
  const frameSrc = `${basePath}/images/polaroid-frame.png`;
  const cvSrc = `${basePath}/cv/Jaime-Rabazo-CV.pdf`;

  // Photo composition: keep --inside-* and --outside-* identical and tweak
  // --outside-cut so the overlay meets the top edge of the frame.
  const photoVars: CSSProperties = {
    ["--photo-scale" as string]: "1.05",
    ["--photo-y" as string]: "26%",
    ["--outside-cut" as string]: "30%",
  };
  const photoTransform =
    "translate(-50%, -50%) translate(0, var(--photo-y)) scale(var(--photo-scale))";

  return (
    <section id="top" className="relative px-5 md:px-10 pt-28 md:pt-36 pb-16 md:pb-24">
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500"
        >
          <span>
            Madrid time <MadridClock />
          </span>
          <span className="text-pen">
            <span className="animate-blink">●</span> Open to new roles
          </span>
        </motion.p>

        <div className="mt-8 grid gap-14 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-10">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease }}
              className="board inline-block p-3 md:p-4"
            >
              <span className="block font-mono font-bold leading-none text-[clamp(2.6rem,8.5vw,6.25rem)]">
                <span className="block">
                  <SplitFlap text="JAIME " tiles step={80} delay={0.2} />
                </span>
                <span className="mt-[0.08em] block">
                  <SplitFlap text="RABAZO" tiles step={80} delay={0.45} />
                </span>
              </span>
              <span className="mt-3 flex justify-between gap-6 whitespace-nowrap px-1 font-mono text-[10px] md:text-[11px] tracking-[0.2em] text-flap/60">
                <span>GATE A24</span>
                <span>CS + BUSINESS · ML + AI</span>
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease }}
            >
              <p className="mt-10 max-w-xl font-serif text-[1.75rem] md:text-[2.15rem] leading-[1.15] text-ink-900">
                I studied computer science and business at the same time.{" "}
                <span className="italic text-ink-600">
                  Mostly, I learned to translate between them.
                </span>
              </p>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-600">
                At Telefónica I built ML that forecasts KPIs across Spain&apos;s
                mobile network, and automated the work around it, giving a
                20-person team back{" "}
                <span className="relative inline-block whitespace-nowrap font-medium text-ink-900">
                  ~160 hours a month
                  <Doodle
                    paths={CIRCLE}
                    viewBox="0 0 200 64"
                    mode="time"
                    delay={1.2}
                    strokeWidth={1.8}
                    stretch
                    className="pointer-events-none absolute -left-2 -top-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)]"
                  />
                </span>
                , now running nationwide. Then at Telefónica Tech I built an AI
                tool for public tenders. Looking for the next place to do that
                kind of work.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <a
                  href="mailto:jaime.rabazofernandez@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full bg-ink-900 px-6 py-3.5 text-sm font-medium text-paper hover:bg-pen transition-colors"
                >
                  Email me <span aria-hidden>→</span>
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-900/20 bg-paper-light px-6 py-3.5 text-sm font-medium text-ink-900 hover:border-ink-900/40 transition-colors"
                >
                  Book a call <span aria-hidden className="text-pen">✈</span>
                </a>
                <a
                  href={cvSrc}
                  download
                  className="inline-flex items-center gap-2 rounded-full border border-ink-900/20 bg-paper-light px-6 py-3.5 text-sm font-medium text-ink-900 hover:border-ink-900/40 transition-colors"
                >
                  Download CV <span aria-hidden className="text-ink-400">↓</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/jaimerabazo"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-3.5 text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors link-reveal"
                >
                  LinkedIn <span aria-hidden>↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Polaroid */}
          <motion.figure
            initial={{ opacity: 0, rotate: 2, y: 20 }}
            animate={{ opacity: 1, rotate: 0, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease }}
            className="relative mx-auto w-full max-w-[340px] md:max-w-[440px]"
          >
            <div className="relative aspect-square w-full -rotate-[3deg] transition-transform duration-700 hover:rotate-0">
              <div className="absolute inset-0" style={photoVars}>
                <div className="absolute inset-0 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroSrc}
                    alt="Jaime Rabazo taking a selfie through a polaroid frame"
                    className="absolute left-1/2 top-1/2 w-full max-w-none select-none"
                    draggable={false}
                    fetchPriority="high"
                    style={{ transform: photoTransform }}
                  />
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frameSrc}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute inset-0 z-10 h-full w-full select-none drop-shadow-[0_28px_42px_rgba(21,21,21,0.16)]"
                  draggable={false}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroSrc}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-full max-w-none select-none"
                  draggable={false}
                  style={{
                    transform: photoTransform,
                    clipPath: "inset(0 0 calc(100% - var(--outside-cut)) 0)",
                  }}
                />
              </div>
            </div>
            <figcaption className="mt-2 flex items-start justify-end gap-2 pr-4">
              <Doodle
                paths={ARROW}
                viewBox="0 0 100 70"
                mode="time"
                delay={1.4}
                className="h-10 w-14 -scale-x-100 rotate-180"
              />
              <Hand as="span" mode="time" delay={1.8} className="text-[1.5rem] -rotate-2">
                that&apos;s me,
                <br />
                mid-wink
              </Hand>
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
