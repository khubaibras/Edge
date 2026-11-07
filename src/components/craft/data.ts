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
  id: "glass";
  /** The product drawn; its name, specs and price come from lib/products. */
  productId: string;
  caption: string;
  legend: { label: string; swatch: string }[];
  features: Feature[];
}

// Plain descriptions of the drawing, using only facts from lib/products.
export const STUDIES: Study[] = [
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
