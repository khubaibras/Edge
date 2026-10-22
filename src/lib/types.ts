export type Category = "flasks" | "glassware" | "crockery";

/** Which studio render to draw (see components/art/ProductArt). */
export type ArtKind =
  | "flask"
  | "bottle"
  | "jug"
  | "tumbler"
  | "doublewall"
  | "carafe"
  | "coupe"
  | "plate"
  | "bowl"
  | "teacup"
  | "mug";

/** Surface finish of the render: steel/coat tones for flasks, glass tints for everything else. */
export type Tone = "steel" | "obsidian" | "stone" | "clear" | "smoke";

/** "front" is the catalog hero angle; "alt" is the secondary angle shown on hover. */
export type ArtView = "front" | "alt";

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  /** Size + material line shown under the name. */
  subtitle: string;
  category: Category;
  /** Whole rupees. Integers keep cart math exact. */
  price: number;
  kind: ArtKind;
  tone: Tone;
  description: string;
  highlights: string[];
  specs: Spec[];
}

export interface CartLine {
  product: Product;
  qty: number;
}
