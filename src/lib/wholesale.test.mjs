import assert from "node:assert/strict";
import { test } from "node:test";
import { EMPTY_WHOLESALE, validateWholesale, wholesaleMessage } from "./wholesale.ts";

const valid = { ...EMPTY_WHOLESALE, name: "Bilal Ahmed", phone: "0321 5556677", city: "Lahore" };

test("wholesale query needs name, mobile, city and a collection", () => {
  assert.deepEqual(Object.keys(validateWholesale(EMPTY_WHOLESALE, [])).sort(), ["city", "collections", "name", "phone"]);
  assert.deepEqual(validateWholesale(valid, ["Kettles"]), {});
  assert.equal(validateWholesale({ ...valid, phone: "042 1234567" }, ["Kettles"]).phone, "Enter a mobile number like 0300 1234567");
});

test("wholesale message lists the picked collections and skips empty optional fields", () => {
  const msg = wholesaleMessage({ ...valid, quantity: " 200  cups " }, ["Tea Wares", "Kettles"]);
  assert.match(msg, /Phone: \+923215556677/);
  assert.match(msg, /Interested in: Tea Wares, Kettles/);
  assert.match(msg, /Quantity: 200 cups/);
  assert.doesNotMatch(msg, /Business:|Message:/);
});
