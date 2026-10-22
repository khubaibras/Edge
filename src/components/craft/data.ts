export interface Feature {
  id: string;
  title: string;
  body: string;
  /** Point on the drawing the leader line touches (viewBox units). */
  target: [number, number];
  /** Where the numbered hotspot sits (viewBox units). */
  callout: [number, number];
}

export interface Study {
  id: "thermal" | "glass";
  /** The product drawn; its name, specs and price come from lib/products. */
  productId: string;
  caption: string;
  legend: { label: string; swatch: string }[];
  features: Feature[];
}

// Plain descriptions of the drawing, using only facts from lib/products.
export const STUDIES: Study[] = [
  {
    id: "thermal",
    productId: "thermal-flask-750",
    caption: "Thermal Flask 750 ml, cut in half",
    legend: [
      { label: "Steel", swatch: "#d6d7d5" },
      { label: "Vacuum", swatch: "#f9f8f6" },
      { label: "Silicone", swatch: "#4a4743" },
    ],
    features: [
      {
        id: "cap",
        title: "Screw cap and seal",
        body: "The cap screws down onto a silicone seal, so the flask doesn't leak in your bag.",
        target: [221, 96],
        callout: [384, 70],
      },
      {
        id: "outer",
        title: "Outer wall",
        body: "The outside wall is brushed stainless steel. Even with cold water inside, it never sweats.",
        target: [261, 250],
        callout: [384, 190],
      },
      {
        id: "vacuum",
        title: "Vacuum between the walls",
        body: "The air between the two steel walls is taken out, so heat can barely cross the gap. Water stays cold for 24 hours and chai stays hot for 12.",
        target: [249, 350],
        callout: [384, 300],
      },
      {
        id: "inner",
        title: "Inner wall",
        body: "Everything your drink touches is 18/8 food-grade stainless steel.",
        target: [233, 432],
        callout: [384, 410],
      },
    ],
  },
  {
    id: "glass",
    productId: "rib-tumbler",
    caption: "Rib Tumbler 300 ml, cut in half",
    legend: [{ label: "Borosilicate glass", swatch: "#d3dcda" }],
    features: [
      {
        id: "wall",
        title: "Borosilicate glass",
        body: "Borosilicate takes hot and cold drinks, so the same tumbler works for chai or iced coffee.",
        target: [300, 276],
        callout: [384, 256],
      },
      {
        id: "ribs",
        title: "Ribbed sides",
        body: "The ribs give a sure grip and catch the light.",
        target: [121, 336],
        callout: [30, 336],
      },
      {
        id: "foot",
        title: "Thick base",
        body: "The base is thick and steady, so the glass sits firmly on the table.",
        target: [236, 436],
        callout: [384, 436],
      },
      {
        id: "clarity",
        title: "Dishwasher safe",
        body: "Both glasses in the set can go straight in the dishwasher.",
        target: [116, 218],
        callout: [30, 192],
      },
    ],
  },
];
