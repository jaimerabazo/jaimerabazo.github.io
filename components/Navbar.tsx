"use client";

import { ComponentProps, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Doodle, ICONS } from "./Doodles";

// `plain` spells out what each themed label means for someone skimming.
const links: { href: string; label: string; plain?: string; lounge?: boolean }[] = [
  { href: "#departures", label: "Departures", plain: "timeline" },
  { href: "#logbook", label: "Logbook", plain: "experience" },
  { href: "#route", label: "Route", plain: "education" },
  { href: "#packing", label: "Packing list", plain: "skills" },
  { href: "#contact", label: "Book a call" },
  // Its own page, not a section: set apart in blue pen with a sofa.
  { href: "/lounge/", label: "Lounge", lounge: true },
];

// Section anchors live on the home page. There they stay plain anchors (the
// smooth-scroll handler picks them up); from other pages they lead home first.
function Sofa({ className }: { className: string }) {
  return <Doodle paths={ICONS.sofa} viewBox="0 0 64 64" mode="mount" delay={0.8} strokeWidth={1.7} className={className} />;
}

function Go({ href, home, ...rest }: { href: string; home: boolean } & Omit<ComponentProps<"a">, "href">) {
  if (href.startsWith("#") && home) return <a href={href} {...rest} />;
  return <Link href={href.startsWith("#") ? `/${href}` : href} {...rest} />;
}

const CV_SRC = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/cv/Jaime-Rabazo-CV.pdf`;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Section anchors live on the home page; from other pages, go there first.
  const pathname = usePathname();
  const home = pathname === "/";
  // Only real pages (the lounge) can be current; section anchors cannot.
  const trim = (p: string) => p.replace(/\/$/, "");
  const isCurrent = (href: string) => !href.startsWith("#") && trim(pathname) === trim(href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scrolling (Lenis and the page itself) behind the full-screen menu,
  // and give keyboard/switch-control users an Escape exit. Focus moves into
  // the menu and Tab cycles between its links and the close button.
  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";
    const focusables = () => [
      toggleRef.current,
      ...Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? []),
    ].filter((el): el is HTMLElement => !!el);
    const first = requestAnimationFrame(() => focusables()[1]?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const els = focusables();
      const i = els.indexOf(document.activeElement as HTMLElement);
      const next = e.shiftKey ? (i <= 0 ? els.length - 1 : i - 1) : (i + 1) % els.length;
      e.preventDefault();
      els[next]?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(first);
      window.__lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled ? "backdrop-blur-md bg-paper/80 border-ink-900/10" : "bg-transparent border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 md:px-10">
          <Go href="#top" home={home} aria-label="Jaime Rabazo — back to top" className="board inline-flex gap-[2px] rounded-md p-1 font-mono text-[15px] font-bold">
            <span className="flap-tile">J</span>
            <span className="flap-tile">R</span>
          </Go>

          <ul className="hidden items-center gap-7 lg:flex whitespace-nowrap font-mono text-[12px] uppercase tracking-[0.12em]">
            {links.map((l) => (
              <li key={l.href} className={clsx(l.lounge && "border-l border-ink-900/15 pl-7")}>
                <Go
                  href={l.href}
                  home={home}
                  aria-current={isCurrent(l.href) ? "page" : undefined}
                  className={clsx(
                    "transition-colors link-reveal",
                    l.lounge ? "inline-flex items-center gap-1.5 text-pen hover:text-ink-900" : "group inline-flex flex-col text-ink-600 hover:text-ink-900"
                  )}
                >
                  {l.lounge && <Sofa className="-my-1 h-6 w-6" />}
                  {l.label}
                  {l.plain && (
                    <span className="mt-0.5 text-[10px] normal-case leading-none tracking-[0.04em] text-ink-500 group-hover:text-ink-700">
                      {l.plain}
                    </span>
                  )}
                </Go>
              </li>
            ))}
          </ul>

          <div className="hidden lg:flex items-center gap-2 whitespace-nowrap">
            <a
              href={CV_SRC}
              download
              className="inline-flex items-center rounded-full border border-ink-900/20 text-ink-900 text-[13px] font-medium px-4 py-2 hover:border-ink-900/40 transition-colors"
            >
              Download CV
            </a>
            <a
              href="mailto:jaime.rabazofernandez@gmail.com"
              className="inline-flex items-center rounded-full bg-ink-900 text-paper text-[13px] font-medium px-4 py-2 hover:bg-pen transition-colors"
            >
              Email me
            </a>
          </div>

          <button
            ref={toggleRef}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="lg:hidden p-2 -mr-2"
            onClick={() => setOpen((v) => !v)}
          >
            <div className="flex flex-col gap-[5px]">
              <span className={`h-[1.5px] w-5 bg-ink-900 transition-transform ${open ? "translate-y-[6.5px] rotate-45" : ""}`} />
              <span className={`h-[1.5px] w-5 bg-ink-900 transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`h-[1.5px] w-5 bg-ink-900 transition-transform ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`} />
            </div>
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.18, ease: "easeIn" } }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 z-40 bg-paper/98 backdrop-blur-md lg:hidden"
          >
            <ul className="flex h-full flex-col items-center justify-center gap-7">
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Go
                    href={l.href}
                    home={home}
                    onClick={() => setOpen(false)}
                    aria-current={isCurrent(l.href) ? "page" : undefined}
                    className={clsx("font-serif text-4xl", l.lounge ? "inline-flex items-center gap-3 text-pen" : "flex flex-col items-center text-ink-900")}
                  >
                    {l.lounge && <Sofa className="h-10 w-10" />}
                    {l.label}
                    {l.plain && (
                      <span className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-500">{l.plain}</span>
                    )}
                  </Go>
                </motion.li>
              ))}
              <li className="mt-6 flex gap-3">
                <a href="mailto:jaime.rabazofernandez@gmail.com" onClick={() => setOpen(false)} className="rounded-full bg-ink-900 text-paper px-6 py-3 text-sm font-medium">
                  Email me
                </a>
                <a href={CV_SRC} download onClick={() => setOpen(false)} className="rounded-full border border-ink-900/20 text-ink-900 px-6 py-3 text-sm font-medium">
                  Download CV
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
