"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import music from "@/public/data/music.json";
import films from "@/public/data/films.json";
import { Hand } from "./Doodles";

// Seat-back entertainment screen with two channels, both refreshed at build
// time (and by the daily scheduled deploy):
// - Music: latest songs from the public Apple Music playlist
//   (scripts/fetch-music.mjs); play uses Apple's 30-second previews.
// - Films: latest films logged on Letterboxd (scripts/fetch-films.mjs).

type Song = (typeof music.songs)[number];
type Film = (typeof films.films)[number];
type Tab = "films" | "music";

const TABS: { id: Tab; label: string }[] = [
  { id: "films", label: "Films" },
  { id: "music", label: "Music" },
];

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
// "★★★★½" from a 0.5–5 rating.
const stars = (r: number | null) => (r ? "★".repeat(Math.floor(r)) + (r % 1 ? "½" : "") : "");
const fmtDay = new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: "UTC" });
const fmtMonth = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });
// "03 JUL 2025", like the boarding pass dates.
const watchedOn = (iso: string) => {
  const d = new Date(iso);
  return `${fmtDay.format(d)} ${fmtMonth.format(d).slice(0, 3)} ${d.getUTCFullYear()}`;
};

// Side text for each channel.
const COPY: Record<Tab, { kicker: string; title: string; body: string; meta: string; note: string }> = {
  music: {
    kicker: "on repeat",
    title: "What's in my headphones",
    body: `The last ${music.songs.length} songs I saved, straight from my Apple Music favourites. Press play for a 30-second taste.`,
    meta: `${music.playlist.total} songs · via Apple Music`,
    note: "volume up, please",
  },
  films: {
    kicker: "now showing",
    title: "What I've been watching",
    body: `The last ${films.films.length} films I logged on Letterboxd, with my rating. Pick one to see what I thought.`,
    meta: `${films.films.length} films · via Letterboxd`,
    note: "popcorn not included",
  },
};

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
    </svg>
  );
}

function SkipIcon({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-4 w-4", back && "rotate-180")} fill="currentColor" aria-hidden>
      <path d="M5 5.5v13a1 1 0 0 0 1.55.83L15 13.6V18a1 1 0 0 0 2 0V6a1 1 0 0 0-2 0v4.4L6.55 4.67A1 1 0 0 0 5 5.5Z" />
    </svg>
  );
}

/** Animated bars next to the song that is playing. */
function Bars() {
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {[0, 0.2, 0.4].map((d) => (
        <span key={d} className="w-[3px] animate-[eq_0.9s_ease-in-out_infinite] rounded-full bg-livery-gold" style={{ animationDelay: `${d}s` }} />
      ))}
    </span>
  );
}

const LIST = "mt-2 max-h-[22rem] space-y-0.5 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] sm:max-h-[26rem]";
const ROW = "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors";
const LABEL = "font-mono text-[10px] uppercase tracking-[0.16em] text-white/45";

function FilmsChannel({ index, onPick }: { index: number; onPick: (i: number) => void }) {
  const film: Film = films.films[index];
  return (
    <>
      <div className="flex min-w-0 flex-col">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={film.poster}
          src={film.poster ?? ""}
          alt={`Poster of ${film.title}`}
          className="mx-auto aspect-[2/3] w-full max-w-[10rem] animate-[fadein_0.5s_ease-out] rounded-lg object-cover shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)] sm:max-w-[12rem]"
        />
        <p className={clsx(LABEL, "mt-4")}>{film.watched ? `Watched ${watchedOn(film.watched)}` : "Watched"}</p>
        <p className="mt-1 font-serif text-[1.35rem] leading-tight">
          {film.title} <span className="text-white/45">{film.year}</span>
        </p>
        <p className="mt-1 flex items-center gap-2 text-[15px] text-livery-gold" aria-label={film.rating ? `${film.rating} out of 5 stars` : undefined}>
          {stars(film.rating)}
          {film.liked && <span className="text-[13px] text-[#ff8a65]" aria-label="liked">♥</span>}
          {film.rewatch && <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">rewatch</span>}
        </p>
        {film.review && (
          <p className="mt-3 line-clamp-4 border-l-2 border-livery-gold/60 pl-3 font-serif text-[14px] italic leading-snug text-white/75">
            “{film.review}”
          </p>
        )}
      </div>

      <div className="min-w-0">
        <p className={LABEL}>Recently watched · latest first</p>
        <ol className={LIST} data-lenis-prevent>
          {films.films.map((f, i) => (
            <li key={`${f.title}-${i}`}>
              <button
                type="button"
                onClick={() => onPick(i)}
                aria-current={i === index}
                className={clsx(ROW, i === index ? "bg-white/[0.12]" : "hover:bg-white/[0.06]")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.poster ?? ""} alt="" loading="lazy" className="h-[54px] w-9 shrink-0 rounded object-cover" />
                <span className="min-w-0 flex-1">
                  <span className={clsx("block truncate text-[13px]", i === index ? "text-livery-gold" : "text-paper-light")}>{f.title}</span>
                  <span className="block truncate text-[12px] text-white/50">{f.year}</span>
                </span>
                <span className="shrink-0 text-[11px] text-livery-gold/80">{stars(f.rating)}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}

export default function InflightEntertainment() {
  const songs: Song[] = music.songs;
  const audio = useRef<HTMLAudioElement>(null);
  const [tab, setTab] = useState<Tab>("music");
  const [index, setIndex] = useState(0);
  const [filmIndex, setFilmIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  // Set when a preview refuses to play (expired URL, network), cleared per song.
  const [failed, setFailed] = useState(false);
  const song = songs[index];
  const fail = () => {
    setPlaying(false);
    setFailed(true);
  };

  // Swap the preview when the song changes; keep playing if it was.
  useEffect(() => {
    const el = audio.current;
    if (!el || !song?.preview) return;
    el.src = song.preview;
    setElapsed(0);
    setFailed(false);
    if (playing) el.play().catch(fail);
    // `playing` is read, not watched: toggling play must not reload the song.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!song) return null;

  const toggle = () => {
    const el = audio.current;
    if (!el || !song.preview) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      el.play()
        .then(() => {
          setPlaying(true);
          setFailed(false);
        })
        .catch(fail);
    }
  };
  const go = (i: number, play = playing) => {
    setPlaying(play);
    if (i === index) {
      if (play && !playing) toggle();
      return;
    }
    setIndex((i + songs.length) % songs.length);
  };
  const switchTo = (t: Tab) => {
    // The music stops when you change channel, like on a real screen.
    if (t !== "music" && playing) toggle();
    setTab(t);
  };
  // Previews last ~30 s; fall back to that before metadata loads.
  const length = audio.current?.duration || 30;
  const copy = COPY[tab];
  const tint = tab === "music" ? song.color ?? "#2a3550" : "#5b3a2e";

  return (
    <section aria-label="In-flight entertainment" className="grid gap-10 py-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center lg:gap-12 lg:py-24">
      <div className="relative flex min-w-0 flex-col pl-6 lg:order-2 lg:pl-8">
        {/* navy spine, matching the reading card */}
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 rounded-full bg-livery" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            aria-live="polite"
          >
            <p className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500 sm:text-[11px] sm:tracking-[0.2em]">
              In-flight entertainment <span className="text-livery-gold">●</span> {copy.kicker}
            </p>
            <p className="mt-3 font-serif text-[1.6rem] leading-[1.08] text-ink-900 sm:text-[2.2rem]">{copy.title}</p>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-600">{copy.body}</p>
            <div className="mt-5 flex flex-wrap items-end gap-x-5 gap-y-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">{copy.meta}</span>
              <Hand as="span" mode="time" delay={0.3} className="text-[1.1rem]">
                {copy.note}
              </Hand>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Seat-back shell around the screen, in the seat's colours */}
      <div className="rounded-[34px] bg-[linear-gradient(160deg,#f4f2ed,#dcd8d0)] p-3 shadow-[0_30px_60px_-35px_rgba(21,21,21,0.6),inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-4 lg:order-1">
        <div className="rounded-[24px] bg-[#0c0d10] p-2 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] sm:p-2.5">
          <div
            className="relative overflow-hidden rounded-[18px] text-paper-light transition-[background] duration-700"
            style={{ background: `radial-gradient(120% 90% at 0% 0%, ${tint}cc, transparent 60%), #10141f` }}
          >
            {/* screen glare */}
            <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.08),transparent_35%)]" />

            {/* top bar */}
            <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] sm:px-5">
              <span className="whitespace-nowrap text-livery-gold">JR 024</span>
              <div role="tablist" aria-label="Channels" className="flex gap-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => switchTo(t.id)}
                    className={clsx(
                      "rounded-full px-3 py-1 uppercase tracking-[0.14em] transition-colors",
                      tab === t.id ? "bg-paper-light text-livery" : "text-white/55 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <span className="hidden whitespace-nowrap text-white/45 sm:inline">MAD → YOU</span>
            </div>

            <div role="tabpanel" className="relative grid gap-5 p-4 sm:min-h-[30rem] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:p-5">
              {tab === "films" ? (
                <FilmsChannel index={filmIndex} onPick={setFilmIndex} />
              ) : (
                <>
                  {/* now playing */}
                  <div className="flex min-w-0 flex-col">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      key={song.cover}
                      src={song.cover ?? ""}
                      alt={`Cover of ${song.album ?? song.title}`}
                      className="mx-auto aspect-square w-full max-w-[15rem] animate-[fadein_0.5s_ease-out] rounded-xl object-cover shadow-[0_18px_40px_-18px_rgba(0,0,0,0.9)] sm:max-w-none"
                    />
                    <p role="status" className={clsx(LABEL, "mt-4 flex items-center gap-2", failed ? "text-[#ff8a65]" : "text-white/50")}>
                      {playing ? <Bars /> : null}
                      {failed
                        ? "Preview unavailable, try the next song"
                        : !song.preview
                          ? "No preview for this song"
                          : playing
                            ? "Now playing"
                            : elapsed > 0
                              ? "Paused"
                              : "Ready to play"}
                    </p>
                    <p className="mt-1 truncate font-serif text-[1.35rem] leading-tight">
                      {song.title}
                      {song.explicit && <span className="ml-2 rounded-[3px] bg-white/20 px-1 align-middle font-mono text-[9px] not-italic">E</span>}
                    </p>
                    <p className="truncate text-[14px] text-white/65">{song.artist}</p>

                    {/* progress of the 30-second preview */}
                    <div className="mt-4">
                      <div className="h-1 overflow-hidden rounded-full bg-white/15">
                        <div className="h-full rounded-full bg-livery-gold transition-[width] duration-200 ease-linear" style={{ width: `${(elapsed / length) * 100}%` }} />
                      </div>
                      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-white/45">
                        <span>{mmss(elapsed)}</span>
                        <span>preview · {mmss(song.duration)}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-6">
                      <button type="button" aria-label="Previous song" onClick={() => go(index - 1)} className="text-white/70 transition-colors hover:text-white">
                        <SkipIcon back />
                      </button>
                      <button
                        type="button"
                        aria-label={playing ? "Pause preview" : "Play 30-second preview"}
                        onClick={toggle}
                        disabled={!song.preview}
                        className="grid h-12 w-12 place-items-center rounded-full bg-paper-light text-livery transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
                      >
                        <PlayIcon playing={playing} />
                      </button>
                      <button type="button" aria-label="Next song" onClick={() => go(index + 1)} className="text-white/70 transition-colors hover:text-white">
                        <SkipIcon />
                      </button>
                    </div>
                  </div>

                  {/* up next */}
                  <div className="min-w-0">
                    <p className={LABEL}>Playlist · latest first</p>
                    <ol className={LIST} data-lenis-prevent>
                      {songs.map((s, i) => (
                        <li key={`${s.title}-${i}`}>
                          <button
                            type="button"
                            onClick={() => go(i, true)}
                            aria-current={i === index}
                            className={clsx(ROW, i === index ? "bg-white/[0.12]" : "hover:bg-white/[0.06]")}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={s.cover ?? ""} alt="" loading="lazy" className="h-9 w-9 shrink-0 rounded-md object-cover" />
                            <span className="min-w-0 flex-1">
                              <span className={clsx("block truncate text-[13px]", i === index ? "text-livery-gold" : "text-paper-light")}>{s.title}</span>
                              <span className="block truncate text-[12px] text-white/50">{s.artist}</span>
                            </span>
                            {i === index && playing ? <Bars /> : <span className="font-mono text-[10px] text-white/35">{mmss(s.duration)}</span>}
                          </button>
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* headphone jack under the screen */}
        <div aria-hidden className="mt-2.5 flex items-center justify-center gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-400">
          <span className="h-2 w-2 rounded-full bg-[#2a2b2f] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          Audio
        </div>
      </div>

      <audio
        ref={audio}
        preload="none"
        onTimeUpdate={(e) => setElapsed(e.currentTarget.currentTime)}
        onEnded={() => go(index + 1, true)}
      />
    </section>
  );
}
