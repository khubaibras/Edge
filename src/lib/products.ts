import type { Category, Product, Spec, Tone } from "./types";

export interface Collection {
  id: Category;
  /** URL anchor on the shop page: /shop#tea-wares */
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
  {
    id: "kettles",
    slug: "kettles",
    label: "Kettles",
    tagline: "stovetop kettles in steel and colour",
    description: "Whistling and pour-over kettles with thick bases that work on gas, electric and induction.",
  },
  {
    id: "flasks",
    slug: "flasks-bottles",
    label: "Flasks & Bottles",
    tagline: "insulated steel, hot or cold",
    description: "Double-wall vacuum flasks, bottles and a table jug that keep chai hot and water cold for hours.",
  },
];

export const COLLECTION_BY_ID = new Map(COLLECTIONS.map((c) => [c.id, c]));

/** One product per colour, all sharing a family id, so cart lines and order messages name the colour. */
function colourways(
  base: Omit<Product, "id" | "subtitle" | "tone" | "family" | "color">,
  family: string,
  size: string,
  colours: { id: string; color: string; tone: Tone }[],
): Product[] {
  return colours.map((c) => ({ ...base, id: c.id, subtitle: `${size} · ${c.color}`, tone: c.tone, family, color: c.color }));
}

const KETTLE_SPECS = (capacity: string, height: string, weight: string, material: string): Spec[] => [
  { label: "Capacity", value: capacity },
  { label: "Height", value: height },
  { label: "Weight", value: weight },
  { label: "Material", value: material },
  { label: "Hobs", value: "Gas, electric, induction" },
];

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
      "A round glass teapot with a removable steel infuser, so loose leaves stay out of the cup. Takes boiling water straight from the kettle.",
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

  /* ---------------------------------------------------------------- Kettles */
  {
    id: "whistling-kettle",
    name: "Whistling Kettle",
    subtitle: "2.5 L · Brushed steel",
    category: "kettles",
    price: 5200,
    kind: "kettle",
    tone: "steel",
    description:
      "A stainless steel stovetop kettle that whistles when the water boils. The thick base heats evenly on gas, electric and induction.",
    highlights: ["Whistles at the boil", "Thick base for gas, electric and induction", "Stay-cool handle and knob"],
    specs: KETTLE_SPECS("2.5 L", "22 cm", "1.1 kg", "18/8 stainless steel"),
  },
  ...colourways(
    {
      name: "Colour Kettle",
      category: "kettles",
      price: 5800,
      kind: "kettle",
      description:
        "The whistling kettle in a smaller size with a glossy enamel coat, in five colours. Same thick base for gas, electric and induction.",
      highlights: ["Whistles at the boil", "Glossy enamel coat over steel", "Thick base for gas, electric and induction"],
      specs: KETTLE_SPECS("2.0 L", "20 cm", "1.0 kg", "Enamel-coated steel"),
    },
    "colour-kettle",
    "2.0 L",
    [
      { id: "colour-kettle-terracotta", color: "Terracotta", tone: "terracotta" },
      { id: "colour-kettle-sage", color: "Sage", tone: "sage" },
      { id: "colour-kettle-cream", color: "Cream", tone: "stone" },
      { id: "colour-kettle-black", color: "Black", tone: "obsidian" },
      { id: "colour-kettle-cobalt", color: "Cobalt", tone: "cobalt" },
    ],
  ),
  ...colourways(
    {
      name: "Pour-Over Kettle",
      category: "kettles",
      price: 4900,
      kind: "gooseneck",
      description:
        "A slim kettle with a long gooseneck spout for a slow, steady pour over coffee or green tea. Works on gas, electric and induction.",
      highlights: ["Gooseneck spout for a controlled pour", "Thick base for gas, electric and induction", "Stay-cool handle"],
      specs: KETTLE_SPECS("1.0 L", "18 cm", "650 g", "18/8 stainless steel"),
    },
    "pour-over-kettle",
    "1.0 L",
    [
      { id: "pour-over-kettle", color: "Brushed steel", tone: "steel" },
      { id: "pour-over-kettle-black", color: "Matte black", tone: "obsidian" },
    ],
  ),

  /* ---------------------------------------------------------------- Flasks & Bottles */
  {
    id: "thermal-flask-750",
    name: "Thermal Flask",
    subtitle: "750 ml · Brushed steel",
    category: "flasks",
    price: 4500,
    kind: "flask",
    tone: "steel",
    description:
      "A double-wall vacuum flask in brushed stainless steel. Keeps water cold for 24 hours and chai hot for 12, and the outside never sweats.",
    highlights: [
      "Double-wall vacuum insulation — 24h cold, 12h hot",
      "Leak-proof screw cap with silicone seal",
      "18/8 food-grade stainless steel",
    ],
    specs: [
      { label: "Capacity", value: "750 ml" },
      { label: "Height", value: "27.5 cm" },
      { label: "Weight", value: "390 g" },
      { label: "Material", value: "18/8 stainless steel" },
      { label: "Care", value: "Hand wash" },
    ],
  },
  {
    id: "thermal-flask-500",
    name: "Thermal Flask Compact",
    subtitle: "500 ml · Matte black",
    category: "flasks",
    price: 3800,
    kind: "flask",
    tone: "obsidian",
    description:
      "The same vacuum insulation in a shorter size that fits a school bag or a car cup holder. The matte finish hides fingerprints and scuffs.",
    highlights: ["Double-wall vacuum insulation — 24h cold, 12h hot", "Matte powder coat, scratch resistant", "Leak-proof screw cap"],
    specs: [
      { label: "Capacity", value: "500 ml" },
      { label: "Height", value: "21 cm" },
      { label: "Weight", value: "310 g" },
      { label: "Material", value: "18/8 stainless steel" },
      { label: "Care", value: "Hand wash" },
    ],
  },
  ...colourways(
    {
      name: "Commuter Bottle",
      category: "flasks",
      price: 3200,
      kind: "bottle",
      description:
        "A slim insulated bottle with a carry loop on the cap, in five colours. The wide mouth takes ice cubes and is easy to clean.",
      highlights: ["Double-wall vacuum insulation — 18h cold, 8h hot", "Carry loop cap, one-hand opening", "Wide mouth for ice and cleaning"],
      specs: [
        { label: "Capacity", value: "420 ml" },
        { label: "Height", value: "22 cm" },
        { label: "Weight", value: "260 g" },
        { label: "Material", value: "18/8 stainless steel" },
        { label: "Care", value: "Hand wash" },
      ],
    },
    "commuter-bottle",
    "420 ml",
    [
      { id: "commuter-bottle", color: "Stone white", tone: "stone" },
      { id: "commuter-bottle-sage", color: "Sage", tone: "sage" },
      { id: "commuter-bottle-terracotta", color: "Terracotta", tone: "terracotta" },
      { id: "commuter-bottle-sand", color: "Sand", tone: "sand" },
      { id: "commuter-bottle-cobalt", color: "Cobalt", tone: "cobalt" },
    ],
  ),
  {
    id: "table-jug",
    name: "Table Jug",
    subtitle: "1.0 L · Steel & wooden lid",
    category: "flasks",
    price: 6500,
    kind: "jug",
    tone: "steel",
    description:
      "A vacuum jug for chai or coffee at the table. Pours without dripping and keeps a full jug hot through a long breakfast.",
    highlights: ["Double-wall vacuum insulation — 12h hot, 24h cold", "Drip-free pouring spout", "Wooden lid with silicone seal"],
    specs: [
      { label: "Capacity", value: "1.0 L" },
      { label: "Height", value: "24 cm" },
      { label: "Weight", value: "720 g" },
      { label: "Material", value: "18/8 stainless steel, wood" },
      { label: "Care", value: "Hand wash" },
    ],
  },
];

export const PRODUCT_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));

/** The shop shows one card per family: colour variants grouped, everything else on its own. */
export const familyKey = (p: Product) => p.family ?? p.id;

export function familiesIn(category: Category): Product[][] {
  const groups = new Map<string, Product[]>();
  for (const p of PRODUCTS) {
    if (p.category !== category) continue;
    const key = familyKey(p);
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }
  return [...groups.values()];
}

/** Picked by the client for the home page carousel. */
export const TOP_SELLING = [
  "glass-dinner-set",
  "thermal-flask-750",
  "colour-kettle-terracotta",
  "glass-tea-set",
  "commuter-bottle-sage",
  "rib-tumbler",
  "glass-teapot",
  "pour-over-kettle",
  "tea-cup-saucer",
  "pour-carafe",
].map((id) => {
  const p = PRODUCT_BY_ID.get(id);
  if (!p) throw new Error(`Unknown product: ${id}`);
  return p;
});

/** Link that opens a product's details on the shop page. */
export const productHref = (p: Product) => `/shop#p-${p.id}`;
export const collectionHref = (id: Category) => `/shop#${COLLECTION_BY_ID.get(id)?.slug ?? ""}`;
