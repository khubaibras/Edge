# EDGE GLASSWARE: store for glass tableware, kettles and flasks

> **Status (27 Oct 2026):** not launched yet: a brand home page, a shop with one page per collection and one page per product, and a wholesale page. The production build, typecheck, lint and all 11 unit tests pass. The brand name, product catalog, prices and delivery terms are placeholders. See [Before launch](#before-launch).

## What it is

EDGE GLASSWARE is an online shop for the Pakistani market. It sells five collections, in the client's order:

- **Tea Wares:** glass tea cups and saucers, a glass mug, a glass teapot with a steel infuser, and a tea set.
- **Drink Wares:** tumblers, double-wall glasses, a carafe, coupe glasses and a water set.
- **Dinner Wares:** glass dinner plates, quarter plates, a serving bowl, dessert bowls and an 18-piece dinner set. All crockery is glass; there are no ceramics.
- **Kettles:** a steel whistling kettle, a colour kettle (5 colours) and a pour-over kettle (2 finishes).
- **Flasks & Bottles:** thermal flasks, a commuter bottle (5 colours) and a table jug.

The site has no backend, no database and no online payment. A customer fills a cart on the order page, and checkout turns it into a ready-made WhatsApp message to the shop. The shop confirms the order on WhatsApp and the customer pays cash on delivery.

## The two pages

- **Home (`/`)** is the brand page. It shows the collections and the reasons to buy, but has no add-to-cart buttons. Every product and collection link leads to the order page.
- **Shop (`/shop`)** is where all ordering happens. `/shop` lists the five collections; each collection has its own page (`/shop/kettles`), and each product has its own page (`/shop/kettles/colour-kettle-sage`).

The cart lives in React context in the root layout, so it carries over when moving between the two pages. Refreshing the page empties it.

## How an order works

1. On a collection page the customer adds products from a card, or opens a product's own page (**Details**) and adds it there. Products that come in colours show swatches; the picked colour is what goes in the cart.
2. In the cart they can change quantities. A bar shows how far they are from free delivery.
3. Checkout asks for name, mobile number, city, address and optional notes. The number must be a Pakistani mobile number (for example `0300 1234567`) and is rewritten as `+923001234567`.
4. The review step shows the exact message that will be sent.
5. **Send on WhatsApp** opens `https://wa.me/923070766667?text=…` with the message filled in. The customer presses send.
6. The cart then empties. The last screen shows the order number and a "send it again" link in case WhatsApp didn't open.

Example of the generated message:

```
Hello EDGE GLASSWARE, I'd like to place an order.

*Order EG-385832*
1. Thermal Flask (750 ml · Brushed steel) × 1 — Rs 4,500
2. Commuter Bottle (420 ml · Terracotta) × 2 — Rs 6,400

Subtotal: Rs 10,900
Delivery: Free
*Total: Rs 10,900*
Payment: Cash on delivery

*Deliver to*
Name: Ali Raza
Phone: +923215556677
City: Karachi
Address: Flat 3B, Block 7, Clifton
Notes: Call before coming
```

The site itself stores and sends nothing. An order exists only once the customer sends that WhatsApp message. Order numbers are random (`EG-` plus 6 digits) and are not tracked anywhere.

## Home page, top to bottom

All paths are under `src/components/`.

| Section | Anchor | What it does | Code |
|---|---|---|---|
| Nav | | The five collections (each opens that collection's page), a **Wholesale** link and a **Shop now** button. Once the cart has something in it, the button becomes **Cart**. On phones, a menu with the collections, page links and WhatsApp. | `layout/Navbar.tsx` |
| Hero | `#top` | Cobalt poster, one slide per collection. Each shows a group of products (e.g. five bottles in different colours) between two big words that name the collection, and a **Shop {collection}** button. Arrows, dots, swipe or arrow keys; autoplay pauses on hover, keyboard focus, while the cart is open, and for reduced-motion users. | `sections/Hero.tsx` |
| Why us | `#why` | Four numbered reasons (glass crockery, flask hours, ordering on WhatsApp, cash on delivery) with a picture for each. Steps through on its own while in view. | `sections/WhyUs.tsx` |
| Top selling | `#top-selling` | Endless row of products that moves on its own and stops while pointed at. Each card opens that product's page. | `sections/TopSelling.tsx` |
| Our collections | `#collections` | One row per collection, image and text alternating sides, with **View collection**. | `sections/Collections.tsx` |
| Inside | `#craft` | Switched off for now (commented out in `src/app/page.tsx`). The flask and the tumbler cut in half; tap a number to see what that part does. | `sections/Craft.tsx`, `craft/` |
| About | `#about`, `#how-to-order` | WhatsApp contact card, the four ordering steps and the questions (delivery answers are in the questions). | `sections/Footer.tsx` (`About`, `OrderSteps`) |
| Order today | | Cobalt closing band: **Shop the range** and **Contact us**. | `sections/Footer.tsx` (`OrderCta`) |
| Footer | | Wordmark, page links and a **Contact us** button. No phone number is shown anywhere. | `sections/Footer.tsx` (`Footer`) |

## Wholesale page (`/wholesale`)

A query form for bulk buyers: name, business, mobile, city, the collections they want (picked from `COLLECTIONS`), quantity and a free-text query. **Send query** opens the query as a WhatsApp message, like an order. Code: `src/app/wholesale/page.tsx`, `src/components/wholesale/WholesaleForm.tsx`, message and checks in `src/lib/wholesale.ts` (tested in `src/lib/wholesale.test.mjs`).

## Shop pages

| Page | What it shows | Code |
|---|---|---|
| `/shop` | "Order" headline and five collection panels; each opens that collection's page. The active panel opens wide; they cycle slowly until you point at one. On phones they become a swipeable row. Then the four ordering steps. | `app/shop/page.tsx`, `shop/ShopHero.tsx` |
| `/shop/<collection>` | Name, tagline, description and group picture, then every product in that collection as cards (Add to cart, Details), the other four collections, and the ordering steps. | `app/shop/[collection]/page.tsx`, `shop/CollectionProducts.tsx`, `shop/ProductCard.tsx` |
| `/shop/<collection>/<product id>` | Large picture with two views, name, price, colours, description, quantity and Add to cart, highlights and specs; then more from the same collection. Each colour is its own page, so the colour dots are links. | `app/shop/[collection]/[product]/page.tsx`, `shop/ProductDetails.tsx` |

On every shop page the nav underlines the current collection and always shows **Cart**; on phones, sticky collection pills sit under the nav (`CollectionBar` in `shop/CollectionProducts.tsx`). The cart is a side panel (cart → delivery details → review → placed), mounted once for the whole site: `cart/CartDrawer.tsx`, `cart/CheckoutForm.tsx`, `cart/checkout.ts`, `Providers.tsx`. Its buttons say **Checkout** and **Place order**; placing the order opens the WhatsApp message.

Collection slugs are in `COLLECTIONS`; links are built with `collectionHref` and `productHref` in `src/lib/products.ts`. All shop pages are prerendered at build time (`generateStaticParams`). The part of a collection or product page that reads the URL sits inside `<Suspense>` (with `shop/ShopSkeleton.tsx` as the placeholder), so navigations show the page frame straight away, as Next's instant-navigation check asks. `shop/ScrollReset.tsx` opens every collection and product page at its top; picking another colour on a product page keeps the scroll position.

## Where to change things

| To change | Edit |
|---|---|
| WhatsApp number, payment method, order message wording | `src/lib/whatsapp.ts`: `WHATSAPP_NUMBER`, `PAYMENT_METHOD`, `orderMessage` |
| "Chat with us" link text, displayed phone number | `src/lib/contact.ts` (built from `WHATSAPP_NUMBER`) |
| Delivery fee, free-delivery threshold, max quantity, price format | `src/lib/cart.ts`: `SHIPPING_FEE`, `FREE_SHIPPING_FROM`, `MAX_QTY`, `formatPrice` |
| Collections: names, order, taglines, descriptions, URL slugs | `COLLECTIONS` in `src/lib/products.ts` |
| Products: names, prices, descriptions, specs, collection, colours | `PRODUCTS` in `src/lib/products.ts` (prices are whole rupees). Colour options are built with `colourways(...)`: one product per colour sharing a `family`. |
| Top selling list | `TOP_SELLING` in `src/lib/products.ts` |
| Hero slides: words per collection | `SLIDES` in `src/components/sections/Hero.tsx` |
| Why us reasons | `REASONS` in `src/components/sections/WhyUs.tsx` |
| Ordering steps, questions, footer links | `STEPS`, `FAQS`, `LINKS` in `src/components/sections/Footer.tsx` |
| Group pictures (which pieces, colours, placement) | `ENSEMBLES` in `src/components/art/sets.tsx` |
| Backdrop colours and words behind group pictures | `SCENES` in `src/components/art/Scene.tsx` |
| Colours and fonts | `src/app/globals.css` (`@theme` tokens), `src/app/layout.tsx` (`next/font`) |
| Page titles and descriptions | `metadata` in `src/app/layout.tsx`, `src/app/shop/page.tsx` and `src/app/wholesale/page.tsx`; collection and product pages build theirs from the catalog |

Prices, fees and the phone number each live in one constant. Changing one updates both pages, the cart totals and the WhatsApp message together.

## Product images

There are no photos. Each product is drawn in code as an SVG "studio render" in `src/components/art/`:

- `metal.tsx`: flask, bottle, table jug, and the kettles (a tapered kettle on a black base, with a V lip or a gooseneck spout).
- `glass.tsx`: tumbler, double-wall glass, carafe, coupe, plate, quarter plates, standing plate, bowl, tea cup, teapot, mug.
- `sets.tsx`: products made of several pieces (tea set, water set, dinner set, dessert bowls) and the five collection group pictures (`ENSEMBLES`). Each group has a measured frame (`box`) so every group fills its space alike.
- `shared.tsx`: finishes (`TONES`, including the coloured coats cobalt, sage, terracotta and sand), swatch colours and shadows.
- `ProductArt.tsx`: `ProductArt` draws one product; `GroupArt` draws a collection's group.
- `Scene.tsx`: a group picture on a wall-and-table backdrop.

A product picks its drawing with `kind` and its finish with `tone`. Every drawing has a front view and an `alt` view, shown on hover.

To switch to real photos later, replace `<ProductArt>` / `<GroupArt>` with `next/image` in `ProductCard`, `ProductDetails`, `CartDrawer`, `TopSelling`, `Hero`, `WhyUs`, `Scene` and `ShopHero`.

## Running it

You need Node 22.18 or newer, because the tests rely on Node's built-in TypeScript support.

```
npm install
npm run dev      # http://localhost:3000 (home), /shop, /wholesale
npm test         # unit tests (node --test)
npm run lint
npm run build    # production build; both pages are fully static
```

Fonts are downloaded from Google Fonts by `next/font` at build time, so the build needs internet access.

## Technical notes

- **Stack:** Next.js 16.4 (App Router, `cacheComponents` on), React 19.3, TypeScript, Tailwind CSS 4 (tokens defined in CSS), Framer Motion 14 and Lucide icons.
- **Next.js docs:** this version has breaking changes compared with older material. `AGENTS.md` points to the docs bundled in `node_modules/next/dist/docs/`.
- **State:** the cart (`CartProvider`) lives in React context, set up in `Providers.tsx` together with the cart drawer, so both pages share them. Nothing is saved, so refreshing the page empties the cart.
- **Hydration safety:** nothing random or date-based is rendered; order numbers are created on click. Computed SVG coordinates are rounded so server and browser markup match.
- **Accessibility:**
  - Side panels trap focus, close on Escape and return focus when closed.
  - Focus rings are visible on both the paper and the cobalt backgrounds.
  - Why us is a tab list (arrow keys move between reasons); colour swatches are radio groups.
  - Motion, the hero autoplay and the auto-stepping sections stop for reduced-motion users.
- **TypeScript config:** `tsconfig.json` sets `allowImportingTsExtensions` so `node --test` can import `.ts` files directly.
- **Tests:**
  - `src/lib/cart.test.mjs`: totals, delivery charge and rupee formatting.
  - `src/lib/whatsapp.test.mjs`: the order message and the wa.me link.
  - `src/components/cart/checkout.test.mjs`: mobile number rules and form validation.

## How it got here

1. **First version:** a minimalist editorial store with US dollar prices, stoneware crockery and a simulated card checkout.
2. **Owner feedback:** glass-only crockery, a reference poster hero, rupee prices and WhatsApp checkout. The catalog moved to glass crockery and rupees, and checkout was rebuilt around WhatsApp and cash on delivery.
3. **Design review loop:** a designer agent built the new direction; an evaluator agent checked it at desktop and mobile sizes and approved it in round 2.
4. **Two pages (27 Oct 2026):** following the client's references (`test-samples/`):
   - The catalog was regrouped into the client's five collections, with kettles, a teapot, sets and colour options added.
   - Home became a brand page: a cleaner hero with collection groups (no count, description, price or delivery pill), Why us, Top selling, Our collections (replacing Ideas), and an "Order today" band after the questions. Delivery details moved into the questions. "How to order" left the nav.
   - The shop and cart moved to the new order page (`/shop`), with its own hero and a shelf per collection. Checkout is unchanged.

## Before launch

- [ ] Confirm the delivery terms: Rs 250 fee, free from Rs 5,000, coverage "anywhere in Pakistan", cash on delivery (`src/lib/cart.ts`, `src/lib/whatsapp.ts`).
- [ ] Replace the sample catalog: product names, prices, specs and colours in `src/lib/products.ts` are placeholders, including the new kettles, teapot and sets.
- [ ] Confirm which products are really top sellers (`TOP_SELLING`).
- [x] Brand name is now "EDGE GLASSWARE" (5 Nov 2026). The full name is used in the wordmark, metadata and WhatsApp greetings; the big background watermarks and the name etched on the drawings use "EDGE" so they fit. Order numbers start with `EG-`. The favicon (`src/app/icon.svg`) is an "E".
- [ ] Test **Send on WhatsApp** on real Android and iPhone devices and in Safari. So far only the generated link has been checked.
- [ ] Decide whether the cart should survive a page refresh (it is kept in memory only).
- [ ] Decide whether orders need recording anywhere besides WhatsApp; there is no order database.
- [ ] Optional: use real product photos instead of the SVG renders.
