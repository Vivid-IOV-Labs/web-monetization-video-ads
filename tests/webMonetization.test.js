import {
  startMonetization,
  stopMonetization,
  getPointerFromMetaTag,
} from "../src/webMonetization";

const paymentPointer = "$custompaymentpointer";

test("Should Start Monetization", () => {
  startMonetization(paymentPointer);
  expect(getPointerFromMetaTag()).toBe(paymentPointer);
});

test("Should Stop Monetization", () => {
  stopMonetization();
  expect(getPointerFromMetaTag()).toBeNull();
});
