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
/** Preload the covers either side of the current one, so prev/next feel instant. */
function usePreloadNeighbours(urls: (string | null | undefined)[], index: number) {
  useEffect(() => {
    for (const d of [1, -1]) {
      const url = urls[(index + d + urls.length) % urls.length];
      if (url) new Image().src = url;
    }
  }, [urls, index]);
}

/**
 * Artwork that holds its space with a recessive shimmer and fades in once
 * loaded. Render it with `key={src}` so each new cover starts from the skeleton.
 */
function Artwork({ src, alt, className }: { src: string | null | undefined; alt: string; className: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  // An image already in cache can finish before hydration attaches onLoad.
  useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);
  return (
    <div className={clsx("overflow-hidden bg-white/[0.06]", !loaded && "skeleton-shimmer", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={src ?? ""}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={clsx("h-full w-full object-cover transition-opacity duration-200 ease-out", loaded ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}

/** Star glyphs for the eye, words for screen readers. */
function Stars({ r }: { r: number | null }) {
  if (!r) return null;
  return (
    <>
      <span aria-hidden>{stars(r)}</span>
      <span className="sr-only">{r} out of 5 stars</span>
    </>
  );
}
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
        <span key={d} className="h-full w-[3px] origin-bottom animate-[eq_0.9s_ease-in-out_infinite] rounded-full bg-livery-gold" style={{ animationDelay: `${d}s` }} />
      ))}
    </span>
  );
}

const COVERS = music.songs.map((s) => s.cover);
const POSTERS = films.films.map((f) => f.poster);

const LIST = "mt-2 max-h-[22rem] space-y-0.5 overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.2)_transparent] [scrollbar-width:thin] sm:max-h-[26rem]";
const ROW = "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors";
const LABEL = "font-mono text-[10px] uppercase tracking-[0.16em] text-white/60";

function FilmsChannel({ index, onPick }: { index: number; onPick: (i: number) => void }) {
  const film: Film = films.films[index];
  usePreloadNeighbours(POSTERS, index);
  return (
    <>
      <div className="flex min-w-0 flex-col">
        <Artwork
          key={film.poster}
          src={film.poster}
          alt={`Poster of ${film.title}`}
          className="mx-auto aspect-[2/3] w-full max-w-[10rem] rounded-lg shadow-art sm:max-w-[12rem]"
        />
        <p className={clsx(LABEL, "mt-4")}>{film.watched ? `Watched ${watchedOn(film.watched)}` : "Watched"}</p>
        <p className="mt-1 font-serif text-[1.35rem] leading-tight">
          {film.title} <span className="text-white/60">{film.year}</span>
        </p>
        <p className="mt-1 flex items-center gap-2 text-[15px] text-livery-gold">
          <Stars r={film.rating} />
          {film.liked && (
            <span className="text-[13px] text-[#ff8a65]">
              <span aria-hidden>♥</span>
              <span className="sr-only">, liked</span>
            </span>
          )}
          {film.rewatch && <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/60">rewatch</span>}
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
                className={clsx(ROW, i === index ? "bg-white/[0.12]" : "hover:bg-white/[0.06] active:bg-white/[0.1]")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.poster ?? ""} alt="" loading="lazy" className="h-[54px] w-9 shrink-0 rounded object-cover" />
                <span className="min-w-0 flex-1">
                  <span className={clsx("block truncate text-[13px]", i === index ? "text-livery-gold" : "text-paper-light")}>{f.title}</span>
                  <span className="block truncate text-[12px] text-white/60">{f.year}</span>
                </span>
                <span className="shrink-0 text-[11px] text-livery-gold/80">
                  <Stars r={f.rating} />
                </span>
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
  // Between pressing play and the first sound (the preview streams on demand).
  const [buffering, setBuffering] = useState(false);
  const song = songs[index];
  usePreloadNeighbours(COVERS, index);
  const fail = () => {
    setPlaying(false);
    setBuffering(false);
    setFailed(true);
  };

  // Swap the preview when the song changes; keep playing if it was.
  useEffect(() => {
    const el = audio.current;
    if (!el || !song?.preview) return;
    el.src = song.preview;
    setElapsed(0);
    setFailed(false);
    if (playing) {
      setBuffering(true);
      el.play().catch(fail);
    }
    // `playing` is read, not watched: toggling play must not reload the song.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!song) return null;

  const toggle = () => {
    const el = audio.current;
    if (!el || !song.preview) return;
    if (playing || buffering) {
      el.pause();
      setPlaying(false);
      setBuffering(false);
    } else {
      setBuffering(true);
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
  // Tab pattern: arrows move between channels, focus follows the selection.
  const onTabKey = (e: React.KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.id === tab);
    const next = TABS[(i + step + TABS.length) % TABS.length].id;
    switchTo(next);
    document.getElementById(`ife-tab-${next}`)?.focus();
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
      <div className="rounded-[34px] bg-[linear-gradient(160deg,#f4f2ed,#dcd8d0)] p-3 [box-shadow:var(--shadow-prop),inset_0_1px_0_rgba(255,255,255,0.8)] sm:p-4 lg:order-1">
        <div className="rounded-[24px] bg-[#0c0d10] p-2 shadow-[inset_0_2px_6px_rgba(0,0,0,0.8)] sm:p-2.5">
          <div
            className="relative overflow-hidden rounded-[18px] bg-[#10141f] text-paper-light"
          >
            {/* Channel/song tint: CSS can't transition gradients, so the new one dissolves in over the old. */}
            <AnimatePresence initial={false}>
              <motion.span
                key={tint}
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{ background: `radial-gradient(120% 90% at 0% 0%, ${tint}cc, transparent 60%)` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.4, ease: "easeInOut" } }}
                exit={{ opacity: 0, transition: { duration: 0, delay: 0.4 } }}
              />
            </AnimatePresence>
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
                    id={`ife-tab-${t.id}`}
                    aria-selected={tab === t.id}
                    aria-controls="ife-panel"
                    tabIndex={tab === t.id ? 0 : -1}
                    onClick={() => switchTo(t.id)}
                    onKeyDown={onTabKey}
                    className={clsx(
                      "min-h-6 rounded-full px-3 py-1.5 uppercase tracking-[0.14em] transition-colors",
                      tab === t.id ? "bg-paper-light text-livery" : "text-white/60 hover:bg-white/10 hover:text-white active:bg-white/15"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <span className="hidden whitespace-nowrap text-white/60 sm:inline">MAD → YOU</span>
            </div>

            <div role="tabpanel" id="ife-panel" aria-labelledby={`ife-tab-${tab}`} className="relative grid gap-5 p-4 sm:min-h-[30rem] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:p-5">
              {tab === "films" ? (
                <FilmsChannel index={filmIndex} onPick={setFilmIndex} />
              ) : (
                <>
                  {/* now playing */}
                  <div className="flex min-w-0 flex-col">
                    <Artwork
                      key={song.cover}
                      src={song.cover}
                      alt={`Cover of ${song.album ?? song.title}`}
                      className="mx-auto aspect-square w-full max-w-[15rem] rounded-xl shadow-art sm:max-w-none"
                    />
                    <p role="status" className={clsx(LABEL, "mt-4 flex items-center gap-2", failed ? "text-[#ff8a65]" : "text-white/60")}>
                      {playing && !buffering ? <Bars /> : null}
                      {failed
                        ? "Preview unavailable, try the next song"
                        : !song.preview
                          ? "No preview for this song"
                          : buffering
                            ? "Tuning in…"
                            : playing
                            ? "Now playing"
                            : elapsed > 0
                              ? "Paused"
                              : "Ready to play"}
                    </p>
                    <p className="mt-1 truncate font-serif text-[1.35rem] leading-tight">
                      {song.title}
                      {song.explicit && <span className="ml-2 rounded-[3px] bg-white/20 px-1 align-middle font-mono text-[9px] not-italic">
                          <span aria-hidden>E</span>
                          <span className="sr-only">explicit</span>
                        </span>}
                    </p>
                    <p className="truncate text-[14px] text-white/65">{song.artist}</p>

                    {/* progress of the 30-second preview */}
                    <div className="mt-4">
                      <div className="h-1 overflow-hidden rounded-full bg-white/15">
                        {/* Linear on purpose: the bar maps elapsed time, it is not a UI gesture. */}
                        <div className="h-full origin-left rounded-full bg-livery-gold transition-transform duration-200 ease-linear" style={{ transform: `scaleX(${elapsed / length})` }} />
                      </div>
                      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-white/60">
                        <span>{mmss(elapsed)}</span>
                        <span>preview · {mmss(song.duration)}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-center gap-3">
                      <button type="button" aria-label="Previous song" onClick={() => go(index - 1)} className="grid h-11 w-11 place-items-center rounded-full text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white active:bg-white/15">
                        <SkipIcon back />
                      </button>
                      <button
                        type="button"
                        aria-label={buffering ? "Loading preview, press to cancel" : playing ? "Pause preview" : "Play 30-second preview"}
                        aria-busy={buffering}
                        onClick={toggle}
                        disabled={!song.preview}
                        className="grid h-12 w-12 place-items-center rounded-full bg-paper-light text-livery transition-[background-color,box-shadow] duration-150 ease-out hover:bg-white active:shadow-pressed disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {buffering ? (
                          <svg viewBox="0 0 24 24" className="h-5 w-5 animate-[spin_0.8s_cubic-bezier(0.4,0,0.2,1)_infinite]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                            <path d="M12 3a9 9 0 1 1-9 9" />
                          </svg>
                        ) : (
                          <PlayIcon playing={playing} />
                        )}
                      </button>
                      <button type="button" aria-label="Next song" onClick={() => go(index + 1)} className="grid h-11 w-11 place-items-center rounded-full text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white active:bg-white/15">
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
                            className={clsx(ROW, i === index ? "bg-white/[0.12]" : "hover:bg-white/[0.06] active:bg-white/[0.1]")}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={s.cover ?? ""} alt="" loading="lazy" className="h-9 w-9 shrink-0 rounded-md object-cover" />
                            <span className="min-w-0 flex-1">
                              <span className={clsx("block truncate text-[13px]", i === index ? "text-livery-gold" : "text-paper-light")}>{s.title}</span>
                              <span className="block truncate text-[12px] text-white/60">{s.artist}</span>
                            </span>
                            {i === index && playing ? <Bars /> : <span className="font-mono text-[10px] text-white/60">{mmss(s.duration)}</span>}
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
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onEnded={() => go(index + 1, true)}
      />
    </section>
  );
}
