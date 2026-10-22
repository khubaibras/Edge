"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Category } from "@/lib/types";

export type Filter = Category | "all";

const FilterContext = createContext<{ filter: Filter; setFilter: (f: Filter) => void } | null>(null);

/** The catalog filter, shared so the nav and hero links (href="#shop") can pre-select a category. */
export function ShopFilterProvider({ children }: { children: React.ReactNode }) {
  const [filter, setFilter] = useState<Filter>("all");
  const value = useMemo(() => ({ filter, setFilter }), [filter]);
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useShopFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useShopFilter must be used inside <ShopFilterProvider>");
  return ctx;
}
