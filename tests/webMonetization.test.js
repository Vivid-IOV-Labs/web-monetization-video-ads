import {
  startMonetization,
  stopMonetization,
  getPointerFromMetaTag,
  observeMetaTagMutations,
} from "../src/webMonetization";

const paymentPointer = "$custompaymentpointer";

const delay = (time) => {
  let timer;
  clearTimeout(timer);
  return new Promise((resolve) => {
    timer = setTimeout(() => {
      resolve(true);
    }, time);
  });
};

describe("WebMonetization", () => {
  it("Should start monetization", () => {
    startMonetization(paymentPointer);
    expect(getPointerFromMetaTag()).toBe(paymentPointer);
  });

  it("Should stop monetization", () => {
    stopMonetization();
    expect(getPointerFromMetaTag()).toBeNull();
  });

  it("Should detect meta has been added and removed and readded", async () => {
    const onAdded = jest.fn();
    const onRemoved = jest.fn();
    observeMetaTagMutations({ onAdded, onRemoved });
    startMonetization();
    await delay(100);
    stopMonetization();
    await delay(100);
    startMonetization();
    await delay(100);
    expect(onAdded).toHaveBeenCalledTimes(2);
    expect(onRemoved).toHaveBeenCalledTimes(1);
  });
});
