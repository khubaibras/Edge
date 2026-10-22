# KROMA: one-page store for flasks and glass tableware

> **Status (22 Oct 2026):** built and design-reviewed, not launched yet. The production build, typecheck, lint and all 11 unit tests pass. The brand name, product catalog, prices and delivery terms are placeholders. See [Before launch](#before-launch).

## What it is

KROMA is a one-page online shop for the Pakistani market. It sells three kinds of products:

- **Flasks:** insulated steel flasks, a commuter bottle and a table jug.
- **Glassware:** tumblers, double-wall glasses, a carafe and coupe glasses.
- **Glass crockery:** glass plates, a serving bowl, tea cups with saucers, and a mug. All crockery is glass; there are no ceramics.

The site has no backend, no database and no online payment. A customer fills a cart, and checkout turns it into a ready-made WhatsApp message to the shop. The shop confirms the order on WhatsApp and the customer pays cash on delivery.

## How an order works

1. The customer adds products to the cart from the hero, the shop grid, a product's details panel or an "Ideas" set.
2. In the cart they can change quantities. A bar shows how far they are from free delivery.
3. Checkout asks for name, mobile number, city, address and optional notes. The number must be a Pakistani mobile number (for example `0300 1234567`) and is rewritten as `+923001234567`.
4. The review step shows the exact message that will be sent.
5. **Send on WhatsApp** opens `https://wa.me/923070766667?text=…` with the message filled in: the WhatsApp app on phones, WhatsApp Web on desktop. The customer presses send.
6. The cart then empties. The last screen shows the order number and a "send it again" link in case WhatsApp didn't open.

Example of the generated message:

```
Hello KROMA, I'd like to place an order.

*Order KR-385832*
1. Thermal Flask (750 ml · Brushed steel) × 1 — Rs 4,500
2. Glass Mug (350 ml · Borosilicate) × 2 — Rs 2,900

Subtotal: Rs 7,400
Delivery: Free
*Total: Rs 7,400*
Payment: Cash on delivery

*Deliver to*
Name: Ali Raza
Phone: +923215556677
City: Karachi
Address: Flat 3B, Block 7, Clifton
Notes: Call before coming
```

The site itself stores and sends nothing. An order exists only once the customer sends that WhatsApp message. Order numbers are random (`KR-` plus 6 digits) and are not tracked anywhere.

## The page, top to bottom

All paths are under `src/components/`.

| Section | Anchor | What it does | Code |
|---|---|---|---|
| Nav | | Category links (All / Flasks / Glassware / Glass Crockery) that filter the shop and scroll to it, a "How to order" link, and Cart with a live item count. On phones, a menu with the same links plus a WhatsApp button. | `layout/Navbar.tsx` |
| Hero | `#top` | Full-bleed cobalt poster. Six products, each with big split words around it (e.g. "HOT / chai for 12 hours" and "COLD / water for 24 hours"). Switch with arrows, dots, swipe or arrow keys; autoplay pauses on hover, keyboard focus, while the cart is open, and for reduced-motion users. Also: price with Add to cart, "Shop flasks / glassware / glass crockery" shortcuts, and a rotating WhatsApp badge. | `sections/Hero.tsx` |
| Shop | `#shop`, `#shop-filters` | 12 products with category filter pills. Hovering a card shows a second angle. **Details** opens a side panel with specs and quantity. | `sections/Catalog.tsx`, `shop/ProductCard.tsx`, `shop/QuickView.tsx`, `shop/ShopFilter.tsx` |
| Inside | `#craft` | The flask and the tumbler cut in half. Tap a numbered point to see what that part does. | `sections/Craft.tsx`, `craft/` |
| Ideas | `#lookbook` | Four product sets (Chai, Dawat, Safar, Paani), each with an "Add all" button. | `sections/Lookbook.tsx` |
| About | `#about`, `#how-to-order` | WhatsApp contact card, the four ordering steps, a delivery table and FAQs. | `sections/Footer.tsx` (`About`) |
| Footer | | Wordmark, section links and the WhatsApp number. | `sections/Footer.tsx` (`Footer`) |
| Cart | | Side panel: cart → delivery details → review → sent. | `cart/CartDrawer.tsx`, `cart/CheckoutForm.tsx`, `cart/checkout.ts` |

## Where to change things

| To change | Edit |
|---|---|
| WhatsApp number, payment method, order message wording | `src/lib/whatsapp.ts`: `WHATSAPP_NUMBER`, `PAYMENT_METHOD`, `orderMessage` |
| "Chat with us" link text, displayed phone number | `src/lib/contact.ts` (built from `WHATSAPP_NUMBER`) |
| Delivery fee, free-delivery threshold, max quantity, price format | `src/lib/cart.ts`: `SHIPPING_FEE`, `FREE_SHIPPING_FROM`, `MAX_QTY`, `formatPrice` |
| Products: names, prices, descriptions, specs, categories | `src/lib/products.ts` (prices are whole rupees) |
| Checkout fields and validation | `src/components/cart/checkout.ts`, `CheckoutForm.tsx` |
| Hero slides: words, product, copy | `SLIDES` in `src/components/sections/Hero.tsx` |
| Ideas sets | `SCENES` in `src/components/sections/Lookbook.tsx` |
| Ordering steps, delivery table, FAQs, footer links | `STEPS`, `DELIVERY`, `FAQS`, `LINKS` in `src/components/sections/Footer.tsx` |
| Colours and fonts | `src/app/globals.css` (`@theme` tokens), `src/app/layout.tsx` (`next/font`) |
| Page title and description | `metadata` in `src/app/layout.tsx` |

Prices, fees and the phone number each live in one constant. Changing one updates the page, the cart totals and the WhatsApp message together.

## Product images

There are no photos. Each product is drawn in code as an SVG "studio render" in `src/components/art/`:

- `metal.tsx` draws the steel pieces.
- `glass.tsx` draws the glass pieces.
- `shared.tsx` holds the shared shading and shadows.
- `ProductArt.tsx` is the component the rest of the site uses.

A product picks its drawing with `kind` (`flask`, `bottle`, `jug`, `tumbler`, `doublewall`, `carafe`, `coupe`, `plate`, `bowl`, `teacup`, `mug`) and its finish with `tone` (`steel`, `obsidian`, `stone`, `clear`, `smoke`). Every drawing has a front view and an `alt` view, which is shown on hover.

To switch to real photos later, replace `<ProductArt>` with `next/image` in `ProductCard`, `QuickView`, `CartDrawer`, `Hero` and `Lookbook`.

## Running it

You need Node 22.18 or newer, because the tests rely on Node's built-in TypeScript support.

```
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests (node --test)
npm run lint
npm run build    # production build; the page is fully static
```

Fonts are downloaded from Google Fonts by `next/font` at build time, so the build needs internet access.

## Technical notes

- **Stack:** Next.js 16.4 (App Router, `cacheComponents` on), React 19.3, TypeScript, Tailwind CSS 4 (tokens defined in CSS), Framer Motion 14 and Lucide icons.
- **Next.js docs:** this version has breaking changes compared with older material. `AGENTS.md` points to the docs bundled in `node_modules/next/dist/docs/`.
- **State:** the cart (`CartProvider`) and the shop filter (`ShopFilterProvider`) live in React context. Nothing is saved, so refreshing the page empties the cart.
- **Hydration safety:** nothing random or date-based is rendered; order numbers are created on click. Computed SVG coordinates are rounded so server and browser markup match.
- **Accessibility:**
  - Side panels trap focus, close on Escape and return focus when closed.
  - Focus rings are visible on both the paper and the cobalt backgrounds.
  - Motion and hero autoplay stop for reduced-motion users.
- **TypeScript config:** `tsconfig.json` sets `allowImportingTsExtensions` so `node --test` can import `.ts` files directly.
- **Tests:**
  - `src/lib/cart.test.mjs`: totals, delivery charge and rupee formatting.
  - `src/lib/whatsapp.test.mjs`: the order message and the wa.me link.
  - `src/components/cart/checkout.test.mjs`: mobile number rules and form validation.

## How it got here

1. **First version:** a minimalist editorial store with US dollar prices, stoneware crockery and a simulated card checkout.
2. **Owner feedback:**
   - It looked like a "fake luxury" site.
   - Crockery must be glass only.
   - No Materials section.
   - The hero should follow a reference poster layout and feel interactive.
   - The About section needed rebuilding.
   - Prices should be in rupees.
   - Checkout should send the order on WhatsApp.
3. **Rework:** the catalog moved to glass crockery and rupees, the Materials section was removed, and checkout was rebuilt around WhatsApp and cash on delivery.
4. **Design review loop:** a designer agent built the new direction. A separate evaluator agent then checked the live site at desktop and mobile sizes, clicking through every flow, and scored it out of 10.

| Round | Verdict | Fidelity | Credibility | Craft | Reference | Interaction | Mobile | Accessibility | Hygiene |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Revise | 9 | 8 | 7 | 9 | 8 | 7 | 6 | 7 |
| 2 | **Approve** | 9 | 9 | 8 | 9 | 9 | 8 | 8 | 9 |

Round 1 asked for seven fixes, all done in round 2:

- "How to order" looked like a template.
- A checkout error message overlapped the next field.
- Focus rings were invisible on cobalt.
- Reduced-motion visitors hit a page-loading (hydration) error.
- "Bestseller" and "New" badges made claims the shop couldn't back up.
- The hero kept animating behind the open cart.
- The hero layout broke at 1024px.

## Before launch

- [ ] Confirm the delivery terms: Rs 250 fee, free from Rs 5,000, coverage "anywhere in Pakistan", cash on delivery (`src/lib/cart.ts`, `src/lib/whatsapp.ts`).
- [ ] Replace the sample catalog: product names, prices and specs in `src/lib/products.ts` are placeholders.
- [ ] Replace the placeholder brand name "KROMA". Search the code for it: wordmark, metadata, WhatsApp greeting, hero watermark, the name etched on the flask drawings, and the favicon in `src/app/icon.svg`.
- [ ] Test **Send on WhatsApp** on real Android and iPhone devices and in Safari. So far only the generated link has been checked.
- [ ] Decide whether orders need recording anywhere besides WhatsApp; there is no order database.
- [ ] Optional: use real product photos instead of the SVG renders.
