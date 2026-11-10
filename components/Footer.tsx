import { Hand } from "./Doodles";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-ink-900/10">
      <div className="mx-auto max-w-6xl px-5 md:px-10 py-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between font-mono text-[12px] uppercase tracking-[0.12em] text-ink-500">
        <p>© {year} Jaime Rabazo Fernández · Made in Madrid</p>
        <Hand mode="time" className="normal-case tracking-normal text-[1.35rem]">
          thanks for flying this far ✈
        </Hand>
        <div className="flex gap-6">
          <a href="https://www.linkedin.com/in/jaimerabazo" target="_blank" rel="noreferrer" className="hover:text-ink-900 link-reveal">
            LinkedIn<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href="https://github.com/jaimerabazo" target="_blank" rel="noreferrer" className="hover:text-ink-900 link-reveal">
            GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
          <a href="mailto:jaime.rabazofernandez@gmail.com" className="hover:text-ink-900 link-reveal">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
