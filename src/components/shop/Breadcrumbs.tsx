import { ChevronRight } from "lucide-react";
import Link from "next/link";

/** Where you are in the shop: Shop › Kettles › Colour Kettle. The last step is the current page. */
export function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] leading-4 font-medium tracking-[0.06em] text-mute uppercase">
        {trail.map((t, i) => (
          <li key={t.label} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight aria-hidden className="size-3" strokeWidth={2} />}
            {t.href ? (
              <Link href={t.href} className="transition-colors hover:text-ink">
                {t.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {t.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
