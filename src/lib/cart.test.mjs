import assert from "node:assert/strict";
import { test } from "node:test";
import { cartTotals, clampQty, formatPrice, FREE_SHIPPING_FROM, SHIPPING_FEE } from "./cart.ts";

const line = (price, qty) => ({ product: { price }, qty });

test("empty cart costs nothing", () => {
  assert.deepEqual(cartTotals([]), { count: 0, subtotal: 0, shipping: 0, total: 0 });
});

test("delivery charged below threshold, free at threshold", () => {
  const big = cartTotals([line(4500, 1), line(2400, 2)]);
  assert.equal(big.count, 3);
  assert.equal(big.subtotal, 9300);
  assert.equal(big.shipping, 0);

  const small = cartTotals([line(1450, 1)]);
  assert.equal(small.shipping, SHIPPING_FEE);
  assert.equal(small.total, 1450 + SHIPPING_FEE);

  assert.equal(cartTotals([line(FREE_SHIPPING_FROM, 1)]).shipping, 0);
});

test("quantity is clamped to 0..10 integers", () => {
  assert.equal(clampQty(-3), 0);
  assert.equal(clampQty(2.7), 2);
  assert.equal(clampQty(99), 10);
});

test("prices format as rupees with thousands separators", () => {
  assert.equal(formatPrice(950), "Rs 950");
  assert.equal(formatPrice(4500), "Rs 4,500");
  assert.equal(formatPrice(125000), "Rs 125,000");
});
