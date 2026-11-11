"use client";

import { useMotionValueEvent, useScroll } from "framer-motion";
import { useRef } from "react";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";

// Not a real map — a hand-drawn take on the route: Madrid → Boston → Madrid → Copenhagen → Madrid.
const ROUTE =
  "M560 330 C 430 130, 250 110, 150 175 C 260 310, 430 370, 560 330 C 610 230, 680 130, 790 95 C 800 210, 700 310, 560 330";

const cities = [
  { name: "BOSTON", x: 150, y: 175, dx: -10, dy: -22, anchor: "middle" },
  { name: "MADRID", x: 560, y: 330, dx: 0, dy: 36, anchor: "middle" },
  { name: "COPENHAGEN", x: 790, y: 95, dx: 16, dy: -14, anchor: "start" },
] as const;

const stamps = [
  {
    city: "Madrid",
    school: "Universidad Carlos III",
    years: "2022 — 2026",
    lines: ["B.Sc. Computer Science & Engineering", "B.A. Business Administration", "Banco Santander Mobility Scholarship"],
    tilt: "-rotate-2",
  },
  {
    city: "Boston",
    school: "Northeastern University",
    years: "2023 — 2024",
    lines: ["Dual CS & BBA · exchange", "GPA 3.75", "Dean's List, Khoury College", "NU Choral Society"],
    tilt: "rotate-1",
  },
  {
    city: "Copenhagen",
    school: "Copenhagen Business School",
    years: "2025",
    lines: ["BBA · exchange semester"],
    tilt: "-rotate-1",
  },
  {
    city: "Madrid",
    school: "Universidad Politécnica",
    years: "2020 — 2022",
    lines: ["Computer Engineering & Business Administration"],
    tilt: "rotate-2",
  },
];

export default function Route() {
  const sectionRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Fly the paper plane along the route as the section scrolls past.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const path = pathRef.current;
    const plane = planeRef.current;
    if (!path || !plane) return;
    const t = Math.min(1, Math.max(0, (v - 0.15) / 0.6));
    const len = path.getTotalLength();
    const p = path.getPointAtLength(len * t);
    const q = path.getPointAtLength(Math.min(len, len * t + 1));
    const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
    plane.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${angle + 12})`);
  });

  return (
    <section id="route" ref={sectionRef} className="relative px-5 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          kicker="Route"
          title="Two degrees, three cities."
          note="not to scale. at all."
        />

        <Reveal amount={0.2} className="mt-8">
          <svg viewBox="0 0 940 420" className="w-full h-auto" aria-hidden>
            <path
              ref={pathRef}
              d={ROUTE}
              fill="none"
              stroke="var(--pen)"
              strokeWidth="2"
              strokeDasharray="2 9"
              strokeLinecap="round"
              opacity="0.7"
            />
            {cities.map((c) => (
              <g key={c.name}>
                <circle cx={c.x} cy={c.y} r="7" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2" />
                <circle cx={c.x} cy={c.y} r="2.5" fill="var(--ink)" />
                <text
                  x={c.x + c.dx}
                  y={c.y + c.dy}
                  textAnchor={c.anchor}
                  className="font-mono"
                  fontSize="15"
                  letterSpacing="3"
                  fill="var(--ink)"
                >
                  {c.name}
                </text>
              </g>
            ))}
            <g ref={planeRef} transform="translate(560 330)">
              <image
                href={`${basePath}/images/paper-plane.webp`}
                x="-26"
                y="-26"
                width="52"
                height="52"
              />
            </g>
          </svg>
        </Reveal>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stamps.map((s, i) => (
            <Reveal key={s.school} delay={i * 0.06}>
              <div className={`h-full rounded-xl border-2 border-dashed border-ink-900/25 bg-paper-light/70 p-5 ${s.tilt}`}>
                <div className="flex items-baseline justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.18em]">
                  <span className="text-pen font-bold">{s.city}</span>
                  <span className="text-ink-500 tabular">{s.years}</span>
                </div>
                <p className="mt-3 font-serif text-[1.45rem] leading-tight text-ink-900">{s.school}</p>
                <ul className="mt-3 space-y-1 text-[14px] text-ink-600">
                  {s.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
