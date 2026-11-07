import { Anatomy } from "@/components/craft/Anatomy";
import { Reveal, SectionHeader } from "@/components/ui/primitives";

export function Craft() {
  return (
    <section id="craft" aria-labelledby="craft-title" className="border-t border-line py-20 sm:py-28 lg:py-24">
      <div className="shell">
        <SectionHeader
          id="craft-title"
          title="Inside"
          italic="the glass, cut in half"
          aside="Tap a number to see what each part does."
        />
        <Reveal className="mt-12 lg:mt-16">
          <Anatomy />
        </Reveal>
      </div>
    </section>
  );
}
