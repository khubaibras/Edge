/** Placeholder for a collection or product page while its URL-specific content loads (usually never seen: the pages are prerendered). */
export function ShopSkeleton({ variant }: { variant: "collection" | "product" }) {
  const block = "rounded-[4px] bg-paper-2";
  return (
    <div aria-busy="true" aria-label="Loading" className="shell pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24">
      <div className={`${block} h-4 w-40`} />
      {variant === "collection" ? (
        <>
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="lg:col-span-5">
              <div className={`${block} h-[clamp(3rem,6.4vw,6rem)] w-3/4`} />
              <div className={`${block} mt-4 h-8 w-2/3`} />
              <div className={`${block} mt-5 h-12 w-full max-w-[42ch]`} />
            </div>
            <div className={`${block} aspect-[16/10] lg:col-span-7`} />
          </div>
          <div className="mt-16 grid grid-cols-2 gap-x-3 sm:gap-x-5 lg:mt-20 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`${block} aspect-[4/5] ${i > 1 ? "hidden lg:block" : ""} ${i > 2 ? "lg:hidden xl:block" : ""}`} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className={`${block} aspect-square lg:col-span-7 lg:aspect-[5/4]`} />
          <div className="lg:col-span-5">
            <div className={`${block} h-4 w-24`} />
            <div className={`${block} mt-3 h-12 w-3/4`} />
            <div className={`${block} mt-4 h-5 w-1/3`} />
            <div className={`${block} mt-6 h-7 w-28`} />
            <div className={`${block} mt-8 h-20 w-full`} />
            <div className={`${block} mt-8 h-12 w-full rounded-full`} />
          </div>
        </div>
      )}
    </div>
  );
}
