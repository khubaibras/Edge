import type { Transition } from "framer-motion";

/** House easing and springs, so every surface moves the same way. */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const SPRING: Transition = { type: "spring", stiffness: 380, damping: 40, mass: 0.9 };
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 160, damping: 22, mass: 0.8 };
