import assert from "node:assert/strict";
import { test } from "node:test";
import { EMPTY_FORM, normalizePhone, validateCheckout } from "./checkout.ts";

const valid = {
  name: "Ayesha Khan",
  phone: "0300 1234567",
  city: "Lahore",
  address: "House 12, Street 4, DHA Phase 5",
  notes: "",
};

test("Pakistani mobile numbers normalise to +92 format", () => {
  assert.equal(normalizePhone("0300 1234567"), "+923001234567");
  assert.equal(normalizePhone("+92 300 1234567"), "+923001234567");
  assert.equal(normalizePhone("923001234567"), "+923001234567");
  assert.equal(normalizePhone("3001234567"), "+923001234567");
  assert.equal(normalizePhone("042 1234567"), null); // landline
  assert.equal(normalizePhone("0300 12345"), null); // too short
});

test("valid form has no errors; notes are optional", () => {
  assert.deepEqual(validateCheckout(valid), {});
});

test("empty form flags the four required fields", () => {
  const errors = validateCheckout(EMPTY_FORM);
  assert.deepEqual(Object.keys(errors).sort(), ["address", "city", "name", "phone"]);
  assert.ok(Object.values(errors).every((m) => m === "Required"));
});

test("bad phone gets a format message", () => {
  assert.match(validateCheckout({ ...valid, phone: "12345" }).phone ?? "", /mobile number/);
});
