jest.mock("../src/receiptVerifier");
jest.mock("../src/vanillaVerification");

import { initFakeMonetization } from "../src/webMonetizationFaker";
import { initMonetizationChecker } from "../src/webMonetizationChecker";
import { verifyReceipt } from "../src/receiptVerifier";
import { getContentProof } from "../src/vanillaVerification";
import { startMonetization } from "../src/webMonetizationHelper";
import { delay, clearDocument } from "../tests/utils";

const paymentPointer = "$custompaymentpointer";

describe("Web Monetization Checker", () => {
  afterEach(() => {
    clearDocument();
  });

  it("Should emit monetization on start error", async () => {
    const config = {
      triggerFail: {
        onStart: true,
      },
    };
    initFakeMonetization(config);
    initMonetizationChecker({
      startErrorWaitingTime: 1000,
    });
    const handler = jest.fn();
    document.monetization.addEventListener("monetizationstart-error", handler);

    startMonetization(paymentPointer);
    await delay(1100);
    expect(handler).toHaveBeenCalled();
  });

  it("Should emit monetization on progress error", async () => {
    const config = {
      triggerFail: {
        onProgress: true,
        timeout: 800,
      },
    };

    initFakeMonetization(config);
    initMonetizationChecker({
      progressErrorWatitingTime: 0,
    });
    const handler = jest.fn();
    document.monetization.addEventListener(
      "monetizationprogress-error",
      handler
    );

    startMonetization(paymentPointer);
    await delay(1000);
    expect(handler).toHaveBeenCalled();
  });

  it("Should emit monetization receipt", async () => {
    verifyReceipt.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(),
    });
    initFakeMonetization();
    initMonetizationChecker({
      receiptVerify: { enabled: true },
    });
    const handler = jest.fn();
    document.monetization.addEventListener("monetizationreceipt", handler);

    startMonetization(paymentPointer);
    await verifyReceipt({ receipt: "receipt" });
    await delay(500);

    expect(handler).toHaveBeenCalled();
  });

  it("Should emit monetization receipt error", async () => {
    verifyReceipt.mockRejectedValue(new Error("Async error"));
    initFakeMonetization();
    initMonetizationChecker({
      receiptVerify: { enabled: true },
    });
    const handler = jest.fn();
    document.monetization.addEventListener(
      "monetizationreceipt-error",
      handler
    );

    startMonetization(paymentPointer);

    await expect(verifyReceipt({ receipt: "receipt" })).rejects.toThrow(
      "Async error"
    );
    await delay(500);

    expect(handler).toHaveBeenCalled();
  });

  it("Should emit vanilla monetization proof", async () => {
    getContentProof.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { proof: "proof" } }),
    });
    initFakeMonetization();
    initMonetizationChecker({
      vanillaCredentials: { enabled: true },
    });
    const handler = jest.fn();
    document.monetization.addEventListener("monetizationproof", handler);

    startMonetization(paymentPointer);
    await getContentProof();
    await delay(500);

    expect(handler).toHaveBeenCalled();
  });

  it("Should emit vanilla monetization proof error", async () => {
    getContentProof.mockRejectedValue(new Error("Async error"));
    initFakeMonetization();
    initMonetizationChecker({
      vanillaCredentials: { enabled: true },
    });
    const handler = jest.fn();
    document.monetization.addEventListener("monetizationproof-error", handler);

    startMonetization(paymentPointer);

    await expect(getContentProof()).rejects.toThrow("Async error");
    await delay(600);

    expect(handler).toHaveBeenCalled();
  });
});
