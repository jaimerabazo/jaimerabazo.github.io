"use client";

import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { Doodle, Hand, UNDERLINE } from "./Doodles";

type Entry = {
  period: string;
  role: string;
  company: string;
  summary: string;
  bullets: string[];
  stack: string[];
  margin: string;
};

const entries: Entry[] = [
  {
    period: "Feb — Aug 2026",
    role: "Bid Manager",
    company: "Telefónica Tech",
    summary:
      "Pre-sales for large public-sector cybersecurity and cloud tenders, for clients such as Aena and the Spanish Ministry of Defence.",
    bullets: [
      "Led technical and commercial inputs on active bids, including a **€200M+** cybersecurity and cloud engagement.",
      "Built an AI-powered tender analysis platform that cut initial RFP triage from **~3 hours to 5 minutes**.",
      "Evolved it into a multi-tenant SaaS with three-layer data isolation and **400+ automated tests (>95% coverage)**.",
    ],
    stack: ["Generative AI", "Python", "SaaS", "Pre-sales"],
    margin: "3 hours → 5 minutes. Per tender.",
  },
  {
    period: "Jun 2025 — Feb 2026",
    role: "Network Automation Engineer",
    company: "Telefónica",
    summary: "ML and automation for the Spanish mobile access network (LTE / 5G NR).",
    bullets: [
      "Built ML-driven optimization systems across **52,000+ LTE and NR cells**, integrating time-series KPI prediction into production platforms.",
      "Trained and deployed **13 ML models** for KPI forecasting and automated parameter tuning.",
      "Automated network processes saving **~160 hours/month** for a 20-person team, now running nationwide.",
    ],
    stack: ["Python", "Time series", "RAN", "SON"],
    margin: "~160h a month ≈ one full-time person, given back.",
  },
];

const sideQuests = [
  {
    title: "Arrays con Gambas",
    where: "JetBrains Hackathon",
    text: "Built end-to-end in Kotlin by a team of four, against the clock.",
    stamp: "WON",
    href: "https://github.com/100475299/HACKATHON-JETBRAINS-ARRAYS-CON-GAMBAS",
  },
  {
    title: "RETO C4DX 2025",
    where: "Creativity for Digital Transformation",
    text: "Digital transformation challenge on Occupational Health & Safety.",
    stamp: "WON",
  },
  {
    title: "FIRST LEGO League",
    where: "2017 — 2023",
    text: "National finalist as a competitor, then 5+ years back as coach and judge.",
    stamp: "FINALIST",
  },
];

// Renders **bold** segments as highlighted metrics.
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") ? (
          <strong
            key={i}
            className="font-semibold text-ink-900 bg-[linear-gradient(transparent_62%,rgba(244,200,74,0.55)_62%)]"
          >
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function Logbook() {
  return (
    <section id="logbook" className="relative px-5 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          kicker="Logbook"
          title="What I did on the way."
          note="numbers first — that's what you're here for"
        />

        <div className="mt-12 space-y-6">
          {entries.map((e) => (
            <Reveal key={e.company} amount={0.1}>
              <article className="relative grid gap-6 rounded-2xl border border-ink-900/10 bg-paper-light p-6 pl-8 md:grid-cols-[1fr_15rem] md:gap-10 md:p-10 md:pl-14">
                {/* notebook margin rule */}
                <span aria-hidden className="absolute inset-y-0 left-4 md:left-8 w-px bg-signal/40" />
                <div>
                  <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-ink-500">
                    {e.period}
                  </p>
                  <h3 className="mt-2 font-serif text-[2rem] md:text-[2.5rem] leading-[1.05] text-ink-900">
                    {e.role}{" "}
                    <span className="italic text-ink-500">at</span>{" "}
                    <span className="relative inline-block">
                      {e.company}
                      <Doodle
                        paths={UNDERLINE}
                        viewBox="0 0 200 18"
                        className="absolute -bottom-2 left-0 h-3 w-full"
                        delay={0.3}
                      />
                    </span>
                  </h3>
                  <p className="mt-4 max-w-2xl text-ink-600 leading-relaxed">{e.summary}</p>
                  <ul className="mt-6 space-y-3 max-w-2xl text-[17px] leading-relaxed text-ink-700">
                    {e.bullets.map((b) => (
                      <li key={b} className="flex gap-3">
                        <span aria-hidden className="mt-[0.15em] font-mono text-ink-400">→</span>
                        <span>
                          <Rich text={b} />
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 font-mono text-[12px] uppercase tracking-[0.12em] text-ink-500">
                    {e.stack.join(" / ")}
                  </p>
                </div>
                <Hand className="self-start text-[1.6rem] md:pt-10 md:rotate-[-3deg]">{e.margin}</Hand>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-500">
            Side quests
          </h3>
        </Reveal>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {sideQuests.map((q, i) => {
            const body = (
              <>
                <span
                  aria-hidden
                  className="absolute right-5 top-5 rotate-[8deg] rounded-md border-2 border-signal/70 px-2 py-0.5 font-mono text-[11px] font-bold tracking-[0.18em] text-signal/80"
                >
                  {q.stamp}
                </span>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500 pr-20">
                  {q.where}
                </p>
                <h4 className="mt-3 font-serif text-[1.65rem] leading-tight text-ink-900">
                  {q.title}
                  {q.href && (
                    <>
                      <span aria-hidden className="ml-2 inline-block text-base text-ink-400 transition-[color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-pen">↗</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </>
                  )}
                </h4>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-600">{q.text}</p>
              </>
            );
            const cls =
              "group relative block h-full rounded-2xl border border-ink-900/10 bg-paper-light p-6 transition-colors duration-200";
            return (
              <Reveal key={q.title} delay={i * 0.06} className="h-full">
                {q.href ? (
                  <a href={q.href} target="_blank" rel="noreferrer" className={`${cls} shadow-card hover:border-ink-900/25`}>
                    {body}
                  </a>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
