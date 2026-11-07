import type { Category, Product } from "./types";

export interface Collection {
  id: Category;
  /** URL of the collection's page: /shop/tea-wares */
  slug: string;
  label: string;
  /** Italic serif line under the name. */
  tagline: string;
  description: string;
}

/** In the order the client listed them. */
export const COLLECTIONS: Collection[] = [
  {
    id: "tea",
    slug: "tea-wares",
    label: "Tea Wares",
    tagline: "cups, saucers, mugs and teapots",
    description: "Clear borosilicate glass for chai and green tea, so you can see the colour of the brew.",
  },
  {
    id: "drink",
    slug: "drink-wares",
    label: "Drink Wares",
    tagline: "tumblers, glasses, carafes and coupes",
    description: "Glasses and carafes for water, juice, lemonade and iced coffee, at the table or in the fridge door.",
  },
  {
    id: "dinner",
    slug: "dinner-wares",
    label: "Dinner Wares",
    tagline: "plates, bowls and full dinner sets",
    description: "Tempered glass plates and bowls for everyday meals and dawats. Microwave and dishwasher safe.",
  },
];

export const COLLECTION_BY_ID = new Map(COLLECTIONS.map((c) => [c.id, c]));

export const PRODUCTS: Product[] = [
  /* ---------------------------------------------------------------- Tea Wares */
  {
    id: "tea-cup-saucer",
    name: "Tea Cup & Saucer",
    subtitle: "Set of 2 · 200 ml",
    category: "tea",
    price: 1800,
    kind: "teacup",
    tone: "clear",
    description: "Clear glass cups and saucers for chai or green tea, so you can see the colour of the brew.",
    highlights: ["Heat-resistant borosilicate glass", "Comfortable handle", "Dishwasher safe"],
    specs: [
      { label: "Capacity", value: "200 ml each" },
      { label: "In the box", value: "2 cups, 2 saucers" },
      { label: "Material", value: "Borosilicate glass" },
      { label: "Care", value: "Dishwasher safe" },
    ],
  },
  {
    id: "glass-mug",
    name: "Glass Mug",
    subtitle: "350 ml · Borosilicate",
    category: "tea",
    price: 1450,
    kind: "mug",
    tone: "clear",
    description:
      "A tall glass mug with a sturdy handle for tea, coffee or hot chocolate. Takes boiling water without cracking.",
    highlights: ["Heat-resistant borosilicate glass", "Thick handle stays cool", "Microwave and dishwasher safe"],
    specs: [
      { label: "Capacity", value: "350 ml" },
      { label: "Height", value: "12 cm" },
      { label: "Material", value: "Borosilicate glass" },
      { label: "Care", value: "Dishwasher safe" },
    ],
  },
  {
    id: "glass-teapot",
    name: "Glass Teapot",
    subtitle: "1.0 L · Steel infuser",
    category: "tea",
    price: 3400,
    kind: "teapot",
    tone: "clear",
    description:
      "A round glass teapot with a removable steel infuser, so loose leaves stay out of the cup. Takes boiling water straight from the boil.",
    highlights: ["Heat-resistant borosilicate glass", "Removable stainless steel infuser", "Steel lid stays put when you pour"],
    specs: [
      { label: "Capacity", value: "1.0 L" },
      { label: "Height", value: "15 cm" },
      { label: "Material", value: "Borosilicate glass, steel" },
      { label: "Care", value: "Glass in the dishwasher, infuser by hand" },
    ],
  },
  {
    id: "glass-tea-set",
    name: "Glass Tea Set",
    subtitle: "Teapot + 4 cups & saucers",
    category: "tea",
    price: 6500,
    kind: "teaset",
    tone: "clear",
    description:
      "The Glass Teapot with four cups and saucers, for chai with guests. Costs less than buying the pieces one by one.",
    highlights: ["1.0 L teapot with a steel infuser", "4 cups and 4 saucers, 200 ml each", "Heat-resistant borosilicate glass"],
    specs: [
      { label: "In the box", value: "1 teapot, 4 cups, 4 saucers" },
      { label: "Teapot", value: "1.0 L" },
      { label: "Cups", value: "200 ml each" },
      { label: "Material", value: "Borosilicate glass, steel" },
      { label: "Care", value: "Dishwasher safe, infuser by hand" },
    ],
  },

  /* ---------------------------------------------------------------- Drink Wares */
  {
    id: "rib-tumbler",
    name: "Rib Tumbler",
    subtitle: "Set of 2 · 300 ml",
    category: "drink",
    price: 2400,
    kind: "tumbler",
    tone: "clear",
    description:
      "Ribbed borosilicate glasses for water, juice or iced coffee. The ribs give a sure grip and catch the light.",
    highlights: ["Borosilicate glass — takes hot and cold drinks", "Thick, steady base", "Dishwasher safe"],
    specs: [
      { label: "Capacity", value: "300 ml each" },
      { label: "Height", value: "10 cm" },
      { label: "In the box", value: "2 glasses" },
      { label: "Material", value: "Borosilicate glass" },
      { label: "Care", value: "Dishwasher safe" },
    ],
  },
  {
    id: "double-wall-glass",
    name: "Double-Wall Glass",
    subtitle: "Set of 2 · 250 ml",
    category: "drink",
    price: 2800,
    kind: "doublewall",
    tone: "clear",
    description:
      "Two layers of glass with air in between, so hot coffee doesn't burn your fingers and cold drinks don't drip on the table.",
    highlights: ["Double wall — no condensation, cool to hold", "Heat-resistant borosilicate glass", "Microwave and dishwasher safe"],
    specs: [
      { label: "Capacity", value: "250 ml each" },
      { label: "Height", value: "11 cm" },
      { label: "In the box", value: "2 glasses" },
      { label: "Material", value: "Borosilicate glass" },
      { label: "Care", value: "Dishwasher safe" },
    ],
  },
  {
    id: "pour-carafe",
    name: "Pour Carafe",
    subtitle: "1.0 L · Glass & cork",
    category: "drink",
    price: 3500,
    kind: "carafe",
    tone: "clear",
    description: "A tall glass carafe for water at the table or in the fridge door. The cork stopper keeps dust out.",
    highlights: ["Heat-resistant borosilicate glass", "Natural cork stopper", "Slim enough for the fridge door"],
    specs: [
      { label: "Capacity", value: "1.0 L" },
      { label: "Height", value: "26 cm" },
      { label: "Material", value: "Borosilicate glass, cork" },
      { label: "Care", value: "Hand wash" },
    ],
  },
  {
    id: "coupe",
    name: "Coupe Glass",
    subtitle: "Set of 2 · 180 ml · Smoke",
    category: "drink",
    price: 3200,
    kind: "coupe",
    tone: "smoke",
    description: "Shallow stemmed glasses in a soft smoke tint for mocktails, desserts or a fancy lemonade.",
    highlights: ["Smoke-tinted glass", "Lead-free", "Hand wash recommended"],
    specs: [
      { label: "Capacity", value: "180 ml each" },
      { label: "Height", value: "14 cm" },
      { label: "In the box", value: "2 glasses" },
      { label: "Material", value: "Lead-free glass" },
      { label: "Care", value: "Hand wash" },
    ],
  },
  {
    id: "glass-water-set",
    name: "Water Set",
    subtitle: "Carafe + 4 tumblers",
    category: "drink",
    price: 7500,
    kind: "waterset",
    tone: "clear",
    description:
      "The Pour Carafe with four Rib Tumblers, for cold water on the dinner table. Costs less than buying the pieces one by one.",
    highlights: ["1.0 L carafe with a cork stopper", "4 ribbed tumblers, 300 ml each", "Heat-resistant borosilicate glass"],
    specs: [
      { label: "In the box", value: "1 carafe, 4 tumblers" },
      { label: "Carafe", value: "1.0 L" },
      { label: "Tumblers", value: "300 ml each" },
      { label: "Material", value: "Borosilicate glass, cork" },
      { label: "Care", value: "Tumblers in the dishwasher, carafe by hand" },
    ],
  },

  /* ---------------------------------------------------------------- Dinner Wares */
  {
    id: "glass-dinner-plate",
    name: "Glass Dinner Plate",
    subtitle: "Set of 2 · Ø 27 cm",
    category: "dinner",
    price: 2600,
    kind: "plate",
    tone: "clear",
    description:
      "Clear tempered-glass plates for everyday meals and dawats. Tougher than ordinary glass and they stack neatly in the cupboard.",
    highlights: ["Tempered glass — resists chips and heat", "Microwave and dishwasher safe", "Stackable"],
    specs: [
      { label: "Diameter", value: "27 cm" },
      { label: "In the box", value: "2 plates" },
      { label: "Material", value: "Tempered glass" },
      { label: "Care", value: "Dishwasher safe" },
    ],
  },
  {
    id: "glass-quarter-plate",
    name: "Glass Quarter Plate",
    subtitle: "Set of 4 · Ø 20 cm",
    category: "dinner",
    price: 2800,
    kind: "sideplate",
    tone: "clear",
    description:
      "Smaller tempered-glass plates for roti, salad, sweets or a side of chutney. They stack with the dinner plates.",
    highlights: ["Tempered glass — resists chips and heat", "Microwave and dishwasher safe", "Stackable"],
    specs: [
      { label: "Diameter", value: "20 cm" },
      { label: "In the box", value: "4 plates" },
      { label: "Material", value: "Tempered glass" },
      { label: "Care", value: "Dishwasher safe" },
    ],
  },
  {
    id: "glass-serving-bowl",
    name: "Glass Serving Bowl",
    subtitle: "Ø 20 cm · 1.4 L",
    category: "dinner",
    price: 2200,
    kind: "bowl",
    tone: "clear",
    description:
      "A wide, clear bowl for salad, raita or fruit. Thick-walled and steady enough to pass around the table.",
    highlights: ["Tempered glass", "Microwave and dishwasher safe", "Wide rim, easy to serve from"],
    specs: [
      { label: "Diameter", value: "20 cm" },
      { label: "Capacity", value: "1.4 L" },
      { label: "Material", value: "Tempered glass" },
      { label: "Care", value: "Dishwasher safe" },
    ],
  },
  {
    id: "glass-dessert-bowl",
    name: "Glass Dessert Bowl",
    subtitle: "Set of 6 · Ø 12 cm",
    category: "dinner",
    price: 2400,
    kind: "dessertbowl",
    tone: "clear",
    description: "Small tempered-glass bowls for kheer, raita, ice cream or a side of daal. They nest to save space.",
    highlights: ["Tempered glass", "Microwave and dishwasher safe", "Nest inside each other"],
    specs: [
      { label: "Diameter", value: "12 cm" },
      { label: "Capacity", value: "300 ml each" },
      { label: "In the box", value: "6 bowls" },
      { label: "Material", value: "Tempered glass" },
      { label: "Care", value: "Dishwasher safe" },
    ],
  },
  {
    id: "glass-dinner-set",
    name: "Glass Dinner Set",
    subtitle: "18 pieces · Serves 6",
    category: "dinner",
    price: 13500,
    kind: "dinnerset",
    tone: "clear",
    description:
      "Six dinner plates, six quarter plates and six dessert bowls in tempered glass: a full table for six. Costs less than buying the pieces one by one.",
    highlights: ["Tempered glass — resists chips and heat", "Microwave and dishwasher safe", "Everything stacks and nests"],
    specs: [
      { label: "In the box", value: "6 dinner plates, 6 quarter plates, 6 dessert bowls" },
      { label: "Dinner plates", value: "Ø 27 cm" },
      { label: "Quarter plates", value: "Ø 20 cm" },
      { label: "Dessert bowls", value: "Ø 12 cm" },
      { label: "Material", value: "Tempered glass" },
      { label: "Care", value: "Dishwasher safe" },
    ],
  },

];

export const PRODUCT_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

/** The shop shows one card per family: colour variants grouped, everything else on its own. */
export const familyKey = (p: Product) => p.family ?? p.id;

/** One collection's families, or every family in the shop (in collection order) when `category` is left out. */
export function familiesIn(category?: Category): Product[][] {
  const groups = new Map<string, Product[]>();
  for (const p of PRODUCTS) {
    if (category && p.category !== category) continue;
    const key = familyKey(p);
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups.values()];
}

/** Picked by the client for the home page carousel. */
export const TOP_SELLING = [
  "glass-dinner-set",
  "glass-tea-set",
  "rib-tumbler",
  "glass-teapot",
  "tea-cup-saucer",
  "pour-carafe",
  "glass-mug",
  "double-wall-glass",
  "glass-water-set",
  "glass-serving-bowl",
].map((id) => {
  const p = PRODUCT_BY_ID.get(id);
  if (!p) throw new Error(`Unknown product: ${id}`);
  return p;
});

export const COLLECTION_BY_SLUG = new Map(COLLECTIONS.map((c) => [c.slug, c]));

/** A collection's own page: /shop/tea-wares */
export const collectionHref = (id: Category) => `/shop/${COLLECTION_BY_ID.get(id)?.slug ?? ""}`;

/** A product's page, inside its collection: /shop/tea-wares/glass-mug */
export const productHref = (p: Product) => `${collectionHref(p.category)}/${p.id}`;

/** All colours of a product (just the product itself when it has none). */
export const familyOf = (p: Product) => (p.family ? PRODUCTS.filter((x) => x.family === p.family) : [p]);
