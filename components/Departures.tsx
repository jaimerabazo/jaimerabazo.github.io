"use client";

import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import SplitFlap from "./SplitFlap";

type Row = {
  when: string;
  to: string;
  as: string;
  status: "BOARDING" | "ARRIVED" | "ON BOARD";
  href?: string;
};

// Newest first, like a real board.
const rows: Row[] = [
  { when: "NEXT", to: "YOUR TEAM?", as: "DATA · AI · STRATEGY", status: "BOARDING", href: "#contact" },
  { when: "2026–", to: "GESTANEX", as: "SOFTWARE ENGINEER", status: "ON BOARD" },
  { when: "2026", to: "TELEFÓNICA TECH", as: "BID MANAGER", status: "ARRIVED" },
  { when: "2025–26", to: "TELEFÓNICA", as: "NETWORK AUTOMATION ENG.", status: "ARRIVED" },
  { when: "2025", to: "COPENHAGEN @ CBS", as: "BBA EXCHANGE", status: "ARRIVED" },
  { when: "2024–26", to: "ESN UC3M", as: "TREASURER", status: "ARRIVED" },
  { when: "2023–24", to: "BOSTON @ NORTHEASTERN", as: "CS + BBA EXCHANGE", status: "ARRIVED" },
  { when: "2022–26", to: "MADRID @ UC3M", as: "CS + BUSINESS DEGREES", status: "ARRIVED" },
  { when: "2020–22", to: "MADRID @ UPM", as: "ENGINEERING + BUSINESS", status: "ARRIVED" },
];

const statusColor: Record<Row["status"], string> = {
  BOARDING: "text-signal animate-blink",
  "ON BOARD": "text-flap",
  ARRIVED: "text-paper/60",
};

export default function Departures() {
  return (
    <section id="departures" className="relative px-5 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          kicker="Departures & arrivals"
          title="The trip so far."
          note="every stop, at a glance ↓"
        />

        <Reveal amount={0.1} className="board mt-10 overflow-hidden p-2 md:p-3">
          <div
            role="table"
            aria-label="Career and education timeline"
            className="font-mono text-[12px] md:text-[14px] uppercase"
          >
            <div
              role="row"
              className="grid grid-cols-[4.5rem_1fr_auto] md:grid-cols-[6rem_1.3fr_1.2fr_7rem] gap-3 px-3 py-2 text-[10px] tracking-[0.2em] text-paper/60"
            >
              <span role="columnheader">Time</span>
              <span role="columnheader">Destination</span>
              <span role="columnheader" className="hidden md:block">Role</span>
              <span role="columnheader" className="text-right">Status</span>
            </div>
            {rows.map((r, i) => {
              const cells = (
                <>
                  <span role="cell" className="text-paper/70 tabular">{r.when}</span>
                  {/* Wraps on phones instead of cutting text off; truncates (with a tooltip) on desktop. */}
                  <span role="cell" className="min-w-0" title={r.to}>
                    {r.href ? (
                      // The link covers the whole row (::after) but keeps the table semantics intact.
                      <a href={r.href} className="block focus-visible:outline-none after:absolute after:inset-0 after:rounded-md">
                        <SplitFlap text={r.to} delay={i * 0.08} className="block text-flap max-md:whitespace-normal md:truncate" />
                        <span className="sr-only"> — book a call</span>
                      </a>
                    ) : (
                      <SplitFlap text={r.to} delay={i * 0.08} className="block text-flap max-md:whitespace-normal md:truncate" />
                    )}
                    <span className="mt-1 block text-[11px] text-paper/60 md:hidden">
                      {r.as}
                    </span>
                  </span>
                  <span role="cell" className="hidden md:block truncate text-paper/70" title={r.as}>
                    {r.as}
                  </span>
                  <span role="cell" className={`text-right ${statusColor[r.status]}`}>
                    {r.status}
                  </span>
                </>
              );
              const rowClass =
                "grid grid-cols-[4.5rem_1fr_auto] md:grid-cols-[6rem_1.3fr_1.2fr_7rem] items-start md:items-center gap-3 rounded-md px-3 py-3 md:py-3.5 border-t border-white/[0.06]";
              return r.href ? (
                <div
                  key={r.to}
                  role="row"
                  className={`${rowClass} relative bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors has-[a:focus-visible]:outline has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-flap`}
                >
                  {cells}
                </div>
              ) : (
                <div key={r.to} role="row" className={rowClass}>
                  {cells}
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
