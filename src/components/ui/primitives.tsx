"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

const BUTTON = {
  base: "inline-flex h-12 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 font-display text-[12px] font-semibold uppercase tracking-[0.06em] transition-[background-color,color,border-color,transform] duration-300 ease-quint active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40",
  primary: "bg-ink text-paper hover:bg-ink-2",
  brand: "bg-brand text-white hover:bg-brand-2",
  secondary: "border border-ink/20 text-ink hover:border-ink",
  /** On the cobalt brand colour. */
  inverse: "bg-white text-brand hover:bg-ice focus-visible:outline-white",
  "outline-inverse": "border border-white/50 text-white hover:border-white hover:bg-white/10",
} as const;

export type ButtonVariant = Exclude<keyof typeof BUTTON, "base">;

/** Class string for buttons and button-styled links (pills). */
export const buttonClass = (variant: ButtonVariant = "primary", className?: string) =>
  cn(BUTTON.base, BUTTON[variant], className);

/** Fade-and-rise once when scrolled into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Section opener in the hero's language: a poster word with an italic serif line under it. */
export function SectionHeader({
  id,
  title,
  italic,
  aside,
  className,
}: {
  id?: string;
  title: string;
  italic: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("grid gap-6 lg:grid-cols-12 lg:items-end", className)}>
      <h2 id={id} className="lg:col-span-8">
        <span className="display block text-[clamp(3rem,6.4vw,6rem)]">{title}</span>
        <span className="mt-2 block font-serif text-[clamp(1.375rem,2.2vw,2rem)] leading-[1.15] tracking-[-0.01em] text-ink-2 italic">
          {italic}
        </span>
      </h2>
      {aside && (
        <div className="max-w-sm text-[15px] leading-relaxed text-mute lg:col-span-4 lg:justify-self-end">{aside}</div>
      )}
    </Reveal>
  );
}
