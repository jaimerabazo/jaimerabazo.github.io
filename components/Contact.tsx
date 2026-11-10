"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useInView } from "framer-motion";
import Reveal from "./Reveal";
import SectionTitle from "./SectionTitle";
import { CIRCLE, Doodle, Hand } from "./Doodles";

const EMAIL = "jaime.rabazofernandez@gmail.com";
const CAL_USERNAME = "jaimerabazo";
const CV_SRC = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/cv/Jaime-Rabazo-CV.pdf`;

type Fare = {
  code: string;
  minutes: number;
  label: string;
  box: string;
  slug: string;
};

// Each fare is a Cal.com event type: cal.com/<username>/<slug>
const fares: Fare[] = [
  { code: "Q", minutes: 30, label: "30-min", box: "30MIN", slug: "30min" },
  { code: "S", minutes: 60, label: "1-hour", box: "1H", slug: "60min" },
  { code: "L", minutes: 90, label: "90-min", box: "1H30", slug: "90min" },
];

const BOOKING_REF = "JR2026A24";
const FLIGHT = "JR 024";

const fmtTime = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", minute: "2-digit" });
const fmtDay = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", day: "2-digit" });
const fmtMonth = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", month: "short" });

// Ticks every 15 s; null until mounted so server and client markup match.
function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// Navy livery band across the top and bottom; columns line up with the body
// so the stub's perforation runs straight through.
const BAND =
  "grid bg-livery text-paper-light [text-shadow:none] md:grid-cols-[1fr_23rem]";
const STUB_EDGE = "border-l-2 border-dashed border-paper-light/25";

// `muted` fields are boarding-pass flavour, not information: kept, but quieter
// than the call length and the Book button.
const MUTED = "opacity-45";

function Field({ label, value, small = false, muted = false }: { label: string; value: ReactNode; small?: boolean; muted?: boolean }) {
  return (
    <div className={muted ? MUTED : undefined}>
      <span className={`block normal-case leading-tight tracking-[0.08em] text-ink-700 ${small ? "text-[8px]" : "text-[9px] md:text-[10px]"}`}>
        {label}
      </span>
      <span className={`block leading-snug ${small ? "text-[13px]" : "mt-0.5 text-[15px] md:text-[17px]"}`}>{value}</span>
    </div>
  );
}

function Label({ text }: { text: string }) {
  return (
    <span className="block text-[9px] md:text-[10px] leading-tight tracking-[0.08em] text-ink-700">
      {text}
    </span>
  );
}

// Hand-drawn ballpoint circle around a value; re-draws when `k` changes.
function PenCircle({ k }: { k: string }) {
  return (
    <Doodle
      key={k}
      mode="mount"
      paths={CIRCLE}
      viewBox="0 0 200 64"
      stretch
      strokeWidth={1.6}
      className="pointer-events-none absolute -left-2 -top-1.5 h-[calc(100%+0.75rem)] w-[calc(100%+1rem)]"
    />
  );
}

// Same J·R flap-tile mark as the navbar's back-to-top logo.
function Brand({ small = false }: { small?: boolean }) {
  return (
    <span
      aria-label="Jaime Rabazo"
      className={`board inline-flex shrink-0 gap-[2px] rounded-md p-1 font-mono font-bold normal-case [text-shadow:none] ${
        small ? "text-[15px]" : "text-[20px] md:text-[24px]"
      }`}
    >
      <span className="flap-tile">J</span>
      <span className="flap-tile">R</span>
    </span>
  );
}

export default function Contact() {
  const [fare, setFare] = useState(fares[0]);
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");
  const emailRef = useRef<HTMLAnchorElement>(null);
  const now = useNow();
  // Pen marks mount (and draw) only once the pass has been seen, so the first
  // tick and circles are drawn in front of the reader rather than off-screen.
  const passRef = useRef<HTMLDivElement>(null);
  const seen = useInView(passRef, { once: true, amount: 0.4 });

  const departs = now === null ? "--:--" : fmtTime.format(now);
  const arrives = now === null ? "--:--" : fmtTime.format(now + fare.minutes * 60_000);
  const date = now === null ? "--" : `${fmtDay.format(now)}${fmtMonth.format(now).toUpperCase().slice(0, 3)}`;
  const bookHref = `https://cal.com/${CAL_USERNAME}/${fare.slug}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopy("copied");
      setTimeout(() => setCopy("idle"), 1800);
    } catch {
      // Clipboard blocked (permissions, insecure context): select the address
      // so a manual Cmd/Ctrl+C still works, and say so.
      const el = emailRef.current;
      const sel = window.getSelection();
      if (el && sel) {
        const range = document.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      setCopy("failed");
      setTimeout(() => setCopy("idle"), 4000);
    }
  };

  return (
    <section id="contact" className="relative px-5 md:px-10 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          kicker="Final call"
          title="Got a seat on your team?"
          note="pick a call length, then book ✈"
        />

        <Reveal className="mt-10">
          <div ref={passRef} className="thermal relative font-mono uppercase md:-rotate-[0.6deg]">
            {/* edge notches, like a torn-off roll */}
            <span aria-hidden className="absolute -left-2 top-[40%] z-10 h-5 w-4 rounded-r-full bg-paper" />
            <span aria-hidden className="absolute -left-2 top-[54%] z-10 h-5 w-4 rounded-r-full bg-paper" />

            {/* ── Top livery band ─────────────────────────────── */}
            <div className={`${BAND} rounded-t-[18px]`}>
              <div className="flex items-center justify-between gap-4 px-5 py-3 md:px-8 md:py-4">
                <span className="flex items-center gap-3">
                  <Brand />
                  <span className="leading-tight">
                    <span className="block text-[13px] md:text-[15px] font-bold tracking-[0.14em]">Jaime Rabazo</span>
                    <span className="block whitespace-nowrap text-[10px] md:text-[11px] tracking-[0.2em] md:tracking-[0.3em] text-livery-gold">Boarding pass</span>
                  </span>
                </span>
                <span className="whitespace-nowrap rounded-full border border-livery-gold/70 opacity-60 px-3 py-1 text-[10px] md:text-[11px] font-bold tracking-[0.2em] text-livery-gold">
                  Fast track
                </span>
              </div>
              <div className={`${STUB_EDGE} hidden items-center px-6 md:flex`}>
                <span className="text-[11px] font-bold tracking-[0.3em] text-livery-gold">Boarding pass</span>
              </div>
            </div>

            <div className="grid md:grid-cols-[1fr_23rem]">
              {/* ── Main coupon ─────────────────────────────── */}
              <div className="p-5 md:p-8">
                {/* Who, booking and flight */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  <Field label="Passenger" value="Recruiter/You" />
                  <Field muted label="Booking ref" value={BOOKING_REF} />
                  <Field
                    label="Flight · Class · Date"
                    value={
                      <span className="tabular">
                        {FLIGHT} · {fare.code} · {date}
                      </span>
                    }
                  />
                </div>

                {/* Route */}
                <div className="mt-6 flex items-center gap-4 md:gap-6">
                  <div>
                    <p className="text-[34px] md:text-[44px] font-bold leading-none tracking-[0.04em]">MAD</p>
                    <Label text={`Madrid · ${departs}`} />
                  </div>
                  <div aria-hidden className="flex flex-1 items-center gap-2 text-ink-900/40">
                    <span className="h-px flex-1 border-t-[1.5px] border-dashed border-current" />
                    <span className="text-[18px] text-livery">✈</span>
                    <span className="h-px flex-1 border-t-[1.5px] border-dashed border-current" />
                  </div>
                  <div className="text-right">
                    <p className="text-[34px] md:text-[44px] font-bold leading-none tracking-[0.04em]">YOU</p>
                    <Label text={`Your team · ${arrives}`} />
                  </div>
                </div>

                {/* Boarding box */}
                <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-[1.5px] border-ink-900 px-3 py-3 md:grid-cols-4 md:px-4">
                  <div>
                    <Label text="Boarding begins" />
                    <p className="mt-1 text-[28px] md:text-[34px] font-bold leading-none">NOW</p>
                  </div>
                  <div>
                    <Label text="Call length" />
                    <p className="mt-1 text-[28px] md:text-[34px] font-bold leading-none">
                      <span className="relative inline-block">
                        {fare.minutes}
                        <span className="ml-1 text-[12px] font-bold normal-case">min.</span>
                        {seen && <PenCircle k={`d-${fare.slug}`} />}
                      </span>
                    </p>
                  </div>
                  <div>
                    <Label text="Boarding gate" />
                    <p className="mt-1 text-[28px] md:text-[34px] font-bold leading-none">A24</p>
                    <Label text="Boarding zone" />
                  </div>
                  <div>
                    <Label text="Seat" />
                    <p className="mt-1 text-[28px] md:text-[34px] font-bold leading-none">1A</p>
                    <p className="mt-1 text-[10px] normal-case">window, always</p>
                  </div>
                </div>

                {/* Selector + group */}
                <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <fieldset>
                    <legend className="text-[12px] md:text-[13px] leading-snug">Pick a call length</legend>
                    <div className="mt-2 flex gap-3">
                      {fares.map((f) => {
                        const active = f.slug === fare.slug;
                        return (
                          <label
                            key={f.slug}
                            className="group cursor-pointer text-center has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-pen"
                          >
                            <input
                              type="radio"
                              name="fare"
                              value={f.slug}
                              checked={active}
                              onChange={() => setFare(f)}
                              className="sr-only"
                            />
                            <span className="block text-[12px] font-bold">{f.box}</span>
                            <span
                              className={`relative mt-0.5 grid h-10 w-14 place-items-center border-[1.5px] border-ink-900 transition-colors ${
                                active ? "" : "group-hover:bg-ink-900/5"
                              }`}
                            >
                              {active && seen && (
                                <Doodle
                                  key={`c-${f.slug}`}
                                  mode="mount"
                                  paths={["M8 16 L 16 25 L 32 4"]}
                                  viewBox="0 0 40 30"
                                  strokeWidth={2.6}
                                  className="h-7 w-9"
                                />
                              )}
                            </span>
                          </label>
                        );
                      })}
                      <Hand as="span" className="self-end pb-1 text-[1.3rem] normal-case">← pick one</Hand>
                    </div>
                  </fieldset>

                  <div className={`flex items-end gap-5 sm:text-right ${MUTED}`}>
                    <div>
                      <Label text="Seq/Bn" />
                      <p className="text-[18px] leading-none">160</p>
                    </div>
                    <p className="text-[30px] md:text-[38px] font-bold leading-none tracking-[0.06em]">Group 1</p>
                  </div>
                </div>
              </div>

              {/* ── Stub ─────────────────────────────── */}
              <div className="relative flex flex-col border-t-2 border-dashed border-ink-900/30 p-5 md:border-l-2 md:border-t-0 md:p-6">
                <p className="text-[11px] font-bold tracking-[0.3em] text-livery md:hidden">Boarding pass</p>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px] leading-snug max-md:mt-3">
                  <Field small label="Name" value="Recruiter/You" />
                  <Field small muted label="Booking ref" value={BOOKING_REF} />
                  <Field small label="From" value="Madrid · MAD" />
                  <Field small label="To" value="Your team · YOU" />
                  <Field small label="Flight" value={`${FLIGHT} · ${fare.code}`} />
                  <Field small label="Date · Departs" value={<span className="tabular">{date} · {departs}</span>} />
                </div>

                <div className="mt-4 flex items-end gap-3">
                  <div className="relative">
                    <p className="text-[8px] normal-case">Gate</p>
                    <p className="border-[1.5px] border-ink-900 px-2 py-0.5 text-[16px]">A24</p>
                    {seen && <PenCircle k={`g-${fare.slug}`} />}
                  </div>
                  <div className="relative">
                    <p className="text-[8px] normal-case">Arrival</p>
                    <p className="border-[1.5px] border-ink-900 px-2 py-0.5 text-[16px] tabular">{arrives}</p>
                    {seen && <PenCircle k={`a-${fare.slug}`} />}
                  </div>
                  <div>
                    <p className="text-[8px] normal-case">Seat</p>
                    <p className="text-[22px] font-bold leading-none">1A</p>
                  </div>
                </div>

                {/* Scan with a phone to book the same call there */}
                <div className="mt-5 flex items-center gap-4">
                  <QRCodeSVG
                    value={bookHref}
                    size={104}
                    level="M"
                    bgColor="transparent"
                    fgColor="#151515"
                    title={`QR code: book a ${fare.label} call on Cal.com`}
                    className="h-[104px] w-[104px] shrink-0"
                  />
                  <div className="leading-snug">
                    <p className="text-[13px] font-bold tracking-[0.08em]">Scan to board</p>
                    <p className="mt-1 text-[11px] normal-case text-ink-700">
                      Book the {fare.label} call from your phone
                    </p>
                  </div>
                </div>

                <a
                  href={bookHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 flex items-center justify-between bg-livery px-4 py-3 text-[13px] font-bold tracking-[0.1em] text-paper-light transition-colors hover:bg-pen max-md:mt-5"
                >
                  Book a {fare.label} call
                  <span aria-hidden className="text-livery-gold">↗</span>
                  <span className="sr-only">(opens Cal.com in a new tab)</span>
                </a>
              </div>
            </div>

            {/* ── Bottom livery band ─────────────────────────────── */}
            <div className={`${BAND} rounded-b-[18px]`}>
              <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2.5 text-[10px] md:px-8 md:text-[11px] tracking-[0.12em]">
                <span>
                  <span className="text-livery-gold">Remarks</span> · Open to relocation · Google Meet
                </span>
                <span className="tabular text-paper-light/40">
                  JR010524 {date} MAD MADRID
                </span>
                <span className="text-paper-light/40 md:hidden">ETKT 160 0052 0013</span>
              </div>
              <div className={`${STUB_EDGE} hidden items-center px-6 text-[10px] tracking-[0.12em] text-paper-light/40 md:flex md:text-[11px]`}>
                ETKT 160 0052 0013
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <p className="mr-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-500">Rather write?</p>
            <a
              ref={emailRef}
              href={`mailto:${EMAIL}`}
              className="inline-flex items-center gap-2 rounded-full border border-ink-900/20 px-5 py-3 text-sm font-medium text-ink-900 hover:border-ink-900/40 transition-colors"
            >
              {EMAIL}
            </a>
            <button
              onClick={copyEmail}
              className="inline-flex items-center rounded-full border border-ink-900/20 px-5 py-3 text-sm font-medium text-ink-900 hover:border-ink-900/40 transition-colors"
            >
              {copy === "copied" ? "Copied ✓" : "Copy email"}
            </button>
            <span role="status" aria-live="polite" className={copy === "failed" ? "text-sm text-ink-600" : "sr-only"}>
              {copy === "copied" && "Email copied to clipboard"}
              {copy === "failed" && "Couldn't copy: address selected, press ⌘/Ctrl+C"}
            </span>
            <a href={CV_SRC} download className="px-3 py-3 text-sm font-medium text-ink-600 hover:text-ink-900 link-reveal">
              Download CV ↓
            </a>
            <a
              href="https://www.linkedin.com/in/jaimerabazo"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-3 text-sm font-medium text-ink-600 hover:text-ink-900 link-reveal"
            >
              LinkedIn ↗
            </a>
            <a
              href="https://github.com/jaimerabazo"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-3 text-sm font-medium text-ink-600 hover:text-ink-900 link-reveal"
            >
              GitHub ↗
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
