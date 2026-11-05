import assert from "node:assert/strict";
import { test } from "node:test";
import { orderMessage, whatsappLink, WHATSAPP_NUMBER } from "./whatsapp.ts";

const flask = { name: "Thermal Flask", subtitle: "750 ml · Brushed steel", price: 4500 };
const mug = { name: "Glass Mug", subtitle: "350 ml · Borosilicate", price: 1450 };
const details = {
  number: "EG-123456",
  name: "  Ayesha   Khan ",
  phone: "+923001234567",
  city: "Lahore",
  address: "House 12,\nDHA Phase 5",
  notes: "",
};

test("message lists items, totals, payment and delivery details", () => {
  const msg = orderMessage(details, [{ product: flask, qty: 1 }, { product: mug, qty: 2 }], {
    subtotal: 7400,
    shipping: 0,
    total: 7400,
  });
  assert.match(msg, /\*Order EG-123456\*/);
  assert.match(msg, /1\. Thermal Flask \(750 ml · Brushed steel\) × 1 — Rs 4,500/);
  assert.match(msg, /2\. Glass Mug \(350 ml · Borosilicate\) × 2 — Rs 2,900/);
  assert.match(msg, /Delivery: Free/);
  assert.match(msg, /\*Total: Rs 7,400\*/);
  assert.match(msg, /Payment: Cash on delivery/);
  assert.match(msg, /Name: Ayesha Khan\n/); // whitespace collapsed
  assert.match(msg, /Address: House 12, DHA Phase 5/); // newline flattened
  assert.doesNotMatch(msg, /Notes:/); // empty notes omitted
});

test("paid delivery is shown as a fee", () => {
  const msg = orderMessage(details, [{ product: mug, qty: 1 }], { subtotal: 1450, shipping: 250, total: 1700 });
  assert.match(msg, /Delivery: Rs 250/);
});

test("link targets the shop number with the message URL-encoded", () => {
  const url = whatsappLink("Total: Rs 4,500 & more\nThanks");
  assert.ok(url.startsWith(`https://wa.me/${WHATSAPP_NUMBER}?text=`));
  assert.equal(WHATSAPP_NUMBER, "923070766667");
  assert.equal(decodeURIComponent(url.split("?text=")[1]), "Total: Rs 4,500 & more\nThanks");
});
