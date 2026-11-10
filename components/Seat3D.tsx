"use client";

import { useMotionValueEvent, useReducedMotion, type MotionValue } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react";

// Economy seat built from CSS 3D boxes, seen from behind. Scroll drives it:
// the tray table unfolds, the book drops onto it, then the camera dives onto
// the cover. Before that the visitor can turn it, recline it and zoom.
// Every face is re-lit each frame from the current view, so the shading
// follows the rotation. No WebGL, no extra dependencies.

type Vec3 = [number, number, number];
type Face = {
  w: number;
  h: number;
  t: string; // CSS transform
  n: Vec3; // outward normal in seat space (CSS axes, y down)
  rgb: Vec3;
  r: number;
  soft: boolean;
  o: number;
  layer: Layer; // the close-up fades the seat first, then the tray, leaving the book
  img?: string;
};

const DEG = Math.PI / 180;
const LIGHT: Vec3 = (() => {
  const v: Vec3 = [-0.35, -0.78, 0.55];
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
})();

// width key, height key, rotation, half-depth key, normal
const FACES: [keyof Dims, keyof Dims, string, keyof Dims, Vec3][] = [
  ["w", "h", "", "d", [0, 0, 1]],
  ["w", "h", "rotateY(180deg)", "d", [0, 0, -1]],
  ["d", "h", "rotateY(90deg)", "w", [1, 0, 0]],
  ["d", "h", "rotateY(-90deg)", "w", [-1, 0, 0]],
  ["w", "d", "rotateX(90deg)", "h", [0, -1, 0]],
  ["w", "d", "rotateX(-90deg)", "h", [0, 1, 0]],
];
type Dims = { w: number; h: number; d: number };

const rotX = (v: Vec3, a: number): Vec3 => {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c];
};
const rotY = (v: Vec3, a: number): Vec3 => {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
};
const rotZ = (v: Vec3, a: number): Vec3 => {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
};
const hex = (h: string): Vec3 => {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const phase = (p: number, a: number, b: number) => smooth(clamp((p - a) / (b - a), 0, 1));

const C = {
  fabric: "#3d63c6",
  shell: "#ebe8e2",
  tray: "#f6f4f0",
  recess: "#d6d2ca",
  armrest: "#f4f3f0",
  mesh: "#45464c",
  metal: "#c2c5cb",
  metalDark: "#9da1a8",
  belt: "#3a3f46",
  pages: "#f3eee3",
  spine: "#3b3a38",
};

// Scroll choreography, as fractions of the section's scroll.
const TRAY = [0.12, 0.42] as const;
const DIVE = [0.5, 0.88] as const;
const CLOSE_UP = { rx: -88, ry: 173 }; // straight down onto the cover, squared to its 7° spin
const REST = { rx: -24, ry: 160 };
const BOOK = { w: 50, h: 74, spin: -7, x: 6 };
const RECLINE = { min: 0, max: 40, start: 14 };
const ZOOM = { min: 0.7, max: 1.8 };

type Layer = "seat" | "tray" | "book";
type BoxOpts = { tilt?: number; spin?: number; r?: number; soft?: boolean; o?: number; layer?: Layer; img?: string };

// Seat space: x right, y up, z toward the seat's front. The tray is on the
// back of the backrest, hinged at its bottom edge; `t` runs 0 (folded) → 1 (level).
// Returns the faces plus the book's resting centre (CSS axes) for the camera.
function buildSeat(t: number, recline: number, cover: string): { faces: Face[]; focus: Vec3 } {
  const faces: Face[] = [];
  const box = (cx: number, cy: number, cz: number, w: number, h: number, d: number, color: string, opts: BoxOpts = {}) => {
    const { tilt = 0, spin = 0, r = 0, soft = false, o = 1, layer = "seat", img } = opts;
    const dims: Dims = { w, h, d };
    FACES.forEach(([wk, hk, rot, dk, n], i) => {
      // the cover is laid out at 4× and scaled back down, so the close-up stays sharp
      const hi = i === 0 && img ? 4 : 1;
      const W = dims[wk] * hi, H = dims[hk] * hi;
      faces.push({
        w: W,
        h: H,
        r,
        soft,
        o,
        layer,
        rgb: hex(i === 1 && img ? C.spine : color),
        n: rotX(rotZ(n, spin * DEG), tilt * DEG),
        img: i === 0 ? img : undefined,
        t:
          `translate3d(${cx - W / 2}px,${-cy - H / 2}px,${cz}px) rotateX(${tilt}deg) rotateZ(${spin}deg) ${rot} ` +
          `translateZ(${dims[dk] / 2}px)${hi > 1 ? ` rotateZ(180deg) scale(${1 / hi})` : ""}`,
      });
    });
  };

  // frame
  for (const s of [-1, 1]) {
    box(s * 78, 38, 48, 10, 76, 10, C.metal);
    box(s * 78, 38, -48, 10, 76, 10, C.metal);
    box(s * 78, 5, 0, 14, 10, 150, C.metalDark);
    box(s * 78, 80, 0, 12, 10, 120, C.metal);
  }
  box(0, 84, 0, 176, 8, 126, C.metalDark);
  box(0, 98, 8, 168, 20, 140, C.fabric, { r: 6, soft: true });

  // backrest, pivoting at the rear of the seat
  const c = Math.cos(recline * DEG), sn = Math.sin(recline * DEG);
  const at = (up: number, fwd: number): [number, number] => [96 + up * c + fwd * sn, -58 - up * sn + fwd * c];
  const tilt = recline;
  let p = at(108, -12);
  box(0, p[0], p[1], 168, 216, 24, C.fabric, { tilt, r: 8, soft: true });
  p = at(104, -27);
  box(0, p[0], p[1], 172, 212, 6, C.shell, { tilt, r: 6 });
  p = at(132, -30.2);
  box(0, p[0], p[1], 128, 86, 1, C.recess, { tilt, r: 4 });
  p = at(180, -31.5);
  box(0, p[0], p[1], 18, 6, 3, "#bfbab1", { tilt, r: 3 });
  p = at(48, -31);
  box(0, p[0], p[1], 120, 44, 3, C.mesh, { tilt, r: 3 });
  p = at(230, 2);
  box(0, p[0], p[1], 124, 46, 30, C.fabric, { tilt, r: 8, soft: true });
  for (const s of [-1, 1]) {
    p = at(228, 10);
    box(s * 56, p[0], p[1], 16, 50, 26, C.fabric, { tilt, r: 6, soft: true });
  }

  // tray table: swings back about its bottom edge until it is level
  const hinge = at(89, -31);
  const T = recline + (90 - recline) * t;
  const tc = Math.cos(T * DEG), ts = Math.sin(T * DEG);
  const along = (k: number, n: number): [number, number] => [hinge[0] + k * tc + n * ts, hinge[1] - k * ts + n * tc];
  p = along(43, -1.5);
  box(0, p[0], p[1], 128, 86, 3, C.tray, { tilt: T, r: 4, layer: "tray" });
  // Nothing below may cut into another box: where 3D faces intersect, the
  // browser has to split them to sort them and gets it wrong now and then
  // (pieces flicker behind the shell, the blue backrest tears through it).
  // Struts and book are also always built (just hidden), so the face list
  // never changes length and faces never swap each other's styles.
  {
    // struts: clear of the shell's back and of the tray's side edges
    const A = recline + (90 - recline) * t * 0.5, L = 30 * t;
    const ac = Math.cos(A * DEG), as = Math.sin(A * DEG);
    const foot = at(89, -33.5);
    for (const s of [-1, 1]) {
      box(s * 68, foot[0] + (L / 2) * ac, foot[1] - (L / 2) * as, 4, Math.max(1, L), 3, C.metal, { tilt: A, o: t > 0.02 ? 1 : 0 });
    }
  }

  // the book is set down on the tray once it is nearly level, coming in from
  // its outer end (dropping straight down would pass through the backrest)
  const k = clamp((t - 0.65) / 0.35, 0, 1);
  p = along(45 + (1 - k) * 30, 3 + (1 - k) * 10);
  box(BOOK.x, p[0], p[1], BOOK.w, BOOK.h, 6, C.pages, { tilt: T, spin: BOOK.spin, r: 1, o: k, layer: "book", img: cover });
  // where it lies once the tray is level: the camera's close-up target (its cover face)
  const focus: Vec3 = [BOOK.x, -(hinge[0] + 6), hinge[1] - 45];

  // armrests
  for (const s of [-1, 1]) {
    box(s * 92, 150, 0, 18, 12, 116, C.armrest, { r: 5 });
    box(s * 92, 116, -42, 12, 58, 14, C.metal);
    box(s * 92, 124, 34, 10, 40, 10, C.metal);
  }

  // seatbelt
  box(-38, 109.5, 22, 68, 3, 12, C.belt, { r: 1 });
  box(38, 109.5, 22, 68, 3, 12, C.belt, { r: 1 });
  box(0, 110, 22, 20, 5, 16, "#c9ced6", { r: 2 });

  return { faces, focus };
}

const SEAT_CENTRE: Vec3 = [0, -170, 0];

type Props = { cover: string; title: string; progress: MotionValue<number> };

export default function Seat3D({ cover, title, progress }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const shadow = useRef<HTMLDivElement>(null);
  const faceEls = useRef<(HTMLDivElement | null)[]>([]);
  const reduce = !!useReducedMotion();

  const [t, setT] = useState(() => phase(progress.get(), ...TRAY));
  const [controls, setControls] = useState(true);
  const [recline, setRecline] = useState(RECLINE.start);
  const [size, setSize] = useState({ w: 380, h: 440 });
  const view = useRef({ ...REST, zoom: 1, vx: 0, vy: 0, touched: false });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const paintRef = useRef<() => void>(() => {});

  const { faces, focus } = useMemo(() => buildSeat(t, recline, cover), [t, recline, cover]);

  useMotionValueEvent(progress, "change", (p) => {
    const next = Math.round(phase(p, ...TRAY) * 1000) / 1000;
    setT((cur) => (cur === next ? cur : next));
    setControls(p < TRAY[0]);
    paintRef.current();
  });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // camera + lighting, written straight to the DOM every frame. A layout
  // effect, so a re-render's flat, unlit face colours never reach the screen.
  useLayoutEffect(() => {
    // leave room for the controls under the seat
    const base = Math.min(size.w / 380, (size.h - 120) / 440);
    const close = Math.min((size.h * 0.7) / BOOK.h, (size.w * 0.8) / BOOK.w);

    const paint = () => {
      const v = view.current;
      const e = phase(progress.get(), ...DIVE);
      const fade = { seat: clamp((e - 0.08) / 0.4, 0, 1), tray: clamp((e - 0.5) / 0.35, 0, 1), book: 0 };
      if (shadow.current) shadow.current.style.opacity = String(1 - fade.seat);
      const dRy = ((((CLOSE_UP.ry - v.ry) % 360) + 540) % 360) - 180;
      const rx = v.rx + (CLOSE_UP.rx - v.rx) * e;
      const ry = v.ry + dRy * e;
      const s0 = base * v.zoom;
      const s = s0 * Math.pow(close / s0, e);
      const pivot = SEAT_CENTRE.map((a, i) => a + (focus[i] - a) * e);
      if (world.current) {
        world.current.style.transform =
          `scale(${s}) rotateX(${rx}deg) rotateY(${ry}deg) ` + `translate3d(${-pivot[0]}px,${-pivot[1]}px,${-pivot[2]}px)`;
      }
      faces.forEach((f, i) => {
        const el = faceEls.current[i];
        if (!el) return;
        const n = rotX(rotY(f.n, ry * DEG), rx * DEG);
        const b = 0.6 + 0.5 * Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
        // the cover ends up flat on, so its lighting eases back to neutral
        if (f.img) el.style.filter = `brightness(${(b + (1 - b) * e).toFixed(3)})`;
        else el.style.backgroundColor = `rgb(${f.rgb.map((x) => Math.min(255, Math.round(x * b))).join(",")})`;
        el.style.opacity = String(f.o * (1 - fade[f.layer]));
      });
    };
    paintRef.current = paint;
    paint();
    if (reduce) return;

    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const v = view.current;
      if (drag.current) return;
      if (!v.touched) {
        v.ry = REST.ry + 16 * Math.sin(now / 2600);
      } else if (Math.abs(v.vx) > 0.01 || Math.abs(v.vy) > 0.01) {
        v.vx *= 0.93;
        v.vy *= 0.93;
        v.ry += v.vx;
        v.rx = clamp(v.rx + v.vy, -60, 15);
      } else return;
      paint();
    };
    // only spend frames while the seat is on screen
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(tick);
    });
    if (stage.current) io.observe(stage.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [faces, focus, size, reduce, progress]);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!controls) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // pointer already gone; the drag still works without capture
    }
    drag.current = { x: e.clientX, y: e.clientY };
    Object.assign(view.current, { touched: true, vx: 0, vy: 0 });
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const v = view.current;
    v.vx = (e.clientX - d.x) * 0.45;
    v.vy = -(e.clientY - d.y) * 0.3;
    v.ry += v.vx;
    v.rx = clamp(v.rx + v.vy, -60, 15);
    d.x = e.clientX;
    d.y = e.clientY;
    paintRef.current();
  };
  const zoomBy = (k: number) => {
    view.current.zoom = clamp(view.current.zoom * k, ZOOM.min, ZOOM.max);
    paintRef.current();
  };
  const reset = () => {
    Object.assign(view.current, { ...REST, zoom: 1, vx: 0, vy: 0, touched: false });
    setRecline(RECLINE.start);
    paintRef.current();
  };

  const btn =
    "btn-secondary flex h-11 w-11 items-center justify-center rounded-full bg-paper-light text-ink-700 hover:text-ink-900";

  return (
    <div className="relative h-full w-full">
      <div
        ref={stage}
        role="img"
        aria-label={`${title}, lying on an aeroplane seat's tray table`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        className={`relative h-full w-full select-none overflow-hidden ${controls ? "cursor-grab active:cursor-grabbing" : ""}`}
        style={{ perspective: 1600, perspectiveOrigin: "50% 40%", touchAction: "pan-y" }}
      >
        <div ref={world} className="absolute left-1/2 top-[calc(50%-56px)] h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
          <div
            ref={shadow}
            aria-hidden
            className="absolute -left-[150px] -top-[130px] h-[260px] w-[300px] rounded-full"
            style={{
              background: "radial-gradient(closest-side, rgba(21,21,21,0.16), rgba(21,21,21,0))",
              transform: "translateY(-1px) rotateX(90deg)",
            }}
          />
          {faces.map((f, i) => (
            <div
              key={i}
              ref={(el) => {
                faceEls.current[i] = el;
              }}
              className="absolute left-0 top-0"
              style={{
                width: f.w,
                height: f.h,
                borderRadius: f.r,
                transform: f.t,
                backfaceVisibility: "hidden",
                boxShadow: f.soft ? "inset 0 0 12px rgba(0,0,0,0.18)" : undefined,
                backgroundColor: f.img ? undefined : `rgb(${f.rgb.join(",")})`,
                backgroundImage: f.img ? `url("${f.img}")` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          ))}
        </div>
      </div>

      <div
        className={`absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 transition-opacity duration-500 ${
          controls ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!controls}
      >
        <label className="flex h-11 items-center gap-3 rounded-full border border-ink-900/15 bg-paper-light px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-600">
          Recline
          <input
            type="range"
            min={RECLINE.min}
            max={RECLINE.max}
            value={recline}
            onChange={(e) => setRecline(Number(e.target.value))}
            tabIndex={controls ? 0 : -1}
            className="w-24 accent-livery"
          />
        </label>
        <div className="flex gap-2">
          <button type="button" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.15)} tabIndex={controls ? 0 : -1} className={btn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M5 12h14" />
            </svg>
          </button>
          <button type="button" aria-label="Zoom in" onClick={() => zoomBy(1.15)} tabIndex={controls ? 0 : -1} className={btn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M5 12h14M12 5v14" />
            </svg>
          </button>
          <button type="button" aria-label="Reset the seat" onClick={reset} tabIndex={controls ? 0 : -1} className={btn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          </button>
        </div>
        <p className="w-full text-center font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">
          Drag to look around · scroll to unfold the tray
        </p>
      </div>
    </div>
  );
}
