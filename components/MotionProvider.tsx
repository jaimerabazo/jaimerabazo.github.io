"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// Honour the OS "reduce motion" setting for every Framer Motion animation
// (reveals, menu, hero); transforms are skipped, opacity fades remain.
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
