/** The three collections the client sells under (see COLLECTIONS in lib/products). */
export type Category = "tea" | "drink" | "dinner";

/** Which studio render to draw (see components/art/ProductArt). */
export type ArtKind =
  | "tumbler"
  | "doublewall"
  | "carafe"
  | "coupe"
  | "plate"
  | "sideplate"
  | "platestand"
  | "bowl"
  | "dessertbowl"
  | "teacup"
  | "teapot"
  | "mug"
  | "teaset"
  | "waterset"
  | "dinnerset";

/** Surface finish of the render: glass tints, plus steel for metal fittings like the teapot infuser. */
export type Tone =
  | "steel"
  | "clear"
  | "smoke";

/** "front" is the catalog hero angle; "alt" is the secondary angle shown on hover. */
export type ArtView = "front" | "alt";

export interface Spec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  /** Size + material line shown under the name. Colour variants include their colour here, so it reaches the order message. */
  subtitle: string;
  category: Category;
  /** Whole rupees. Integers keep cart math exact. */
  price: number;
  kind: ArtKind;
  tone: Tone;
  description: string;
  highlights: string[];
  specs: Spec[];
  /** Products sharing a family are one item in different colours; the shop shows them as one card with swatches. */
  family?: string;
  /** Colour name for the swatch, e.g. "Sage". */
  color?: string;
}

export interface CartLine {
  product: Product;
  qty: number;
}
