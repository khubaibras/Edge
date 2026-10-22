import type { Category, Product } from "./types";

export const CATEGORIES: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "flasks", label: "Flasks" },
  { id: "glassware", label: "Glassware" },
  { id: "crockery", label: "Glass Crockery" },
];

export const PRODUCTS: Product[] = [
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
    highlights: [
      "Double-wall vacuum insulation — 24h cold, 12h hot",
      "Matte powder coat, scratch resistant",
      "Leak-proof screw cap",
    ],
    specs: [
      { label: "Capacity", value: "500 ml" },
      { label: "Height", value: "21 cm" },
      { label: "Weight", value: "310 g" },
      { label: "Material", value: "18/8 stainless steel" },
      { label: "Care", value: "Hand wash" },
    ],
  },
  {
    id: "commuter-bottle",
    name: "Commuter Bottle",
    subtitle: "420 ml · Stone white",
    category: "flasks",
    price: 3200,
    kind: "bottle",
    tone: "stone",
    description:
      "A slim insulated bottle with a carry loop on the cap. The wide mouth takes ice cubes and is easy to clean.",
    highlights: [
      "Double-wall vacuum insulation — 18h cold, 8h hot",
      "Carry loop cap, one-hand opening",
      "Wide mouth for ice and cleaning",
    ],
    specs: [
      { label: "Capacity", value: "420 ml" },
      { label: "Height", value: "22 cm" },
      { label: "Weight", value: "260 g" },
      { label: "Material", value: "18/8 stainless steel" },
      { label: "Care", value: "Hand wash" },
    ],
  },
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
    highlights: [
      "Double-wall vacuum insulation — 12h hot, 24h cold",
      "Drip-free pouring spout",
      "Wooden lid with silicone seal",
    ],
    specs: [
      { label: "Capacity", value: "1.0 L" },
      { label: "Height", value: "24 cm" },
      { label: "Weight", value: "720 g" },
      { label: "Material", value: "18/8 stainless steel, wood" },
      { label: "Care", value: "Hand wash" },
    ],
  },
  {
    id: "rib-tumbler",
    name: "Rib Tumbler",
    subtitle: "Set of 2 · 300 ml",
    category: "glassware",
    price: 2400,
    kind: "tumbler",
    tone: "clear",
    description:
      "Ribbed borosilicate glasses for water, juice or iced coffee. The ribs give a sure grip and catch the light.",
    highlights: [
      "Borosilicate glass — takes hot and cold drinks",
      "Thick, steady base",
      "Dishwasher safe",
    ],
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
    category: "glassware",
    price: 2800,
    kind: "doublewall",
    tone: "clear",
    description:
      "Two layers of glass with air in between, so hot coffee doesn't burn your fingers and cold drinks don't drip on the table.",
    highlights: [
      "Double wall — no condensation, cool to hold",
      "Heat-resistant borosilicate glass",
      "Microwave and dishwasher safe",
    ],
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
    category: "glassware",
    price: 3500,
    kind: "carafe",
    tone: "clear",
    description:
      "A tall glass carafe for water at the table or in the fridge door. The cork stopper keeps dust out.",
    highlights: [
      "Heat-resistant borosilicate glass",
      "Natural cork stopper",
      "Slim enough for the fridge door",
    ],
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
    category: "glassware",
    price: 3200,
    kind: "coupe",
    tone: "smoke",
    description:
      "Shallow stemmed glasses in a soft smoke tint for mocktails, desserts or a fancy lemonade.",
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
    id: "glass-dinner-plate",
    name: "Glass Dinner Plate",
    subtitle: "Set of 2 · Ø 27 cm",
    category: "crockery",
    price: 2600,
    kind: "plate",
    tone: "clear",
    description:
      "Clear tempered-glass plates for everyday meals and dawats. Tougher than ordinary glass and they stack neatly in the cupboard.",
    highlights: [
      "Tempered glass — resists chips and heat",
      "Microwave and dishwasher safe",
      "Stackable",
    ],
    specs: [
      { label: "Diameter", value: "27 cm" },
      { label: "In the box", value: "2 plates" },
      { label: "Material", value: "Tempered glass" },
      { label: "Care", value: "Dishwasher safe" },
    ],
  },
  {
    id: "glass-serving-bowl",
    name: "Glass Serving Bowl",
    subtitle: "Ø 20 cm · 1.4 L",
    category: "crockery",
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
    id: "tea-cup-saucer",
    name: "Tea Cup & Saucer",
    subtitle: "Set of 2 · 200 ml",
    category: "crockery",
    price: 1800,
    kind: "teacup",
    tone: "clear",
    description:
      "Clear glass cups and saucers for chai or green tea, so you can see the colour of the brew.",
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
    category: "crockery",
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
];

export const PRODUCT_BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]));
