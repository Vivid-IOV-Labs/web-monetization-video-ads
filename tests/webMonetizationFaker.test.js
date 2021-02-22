import { initFakeMonetization } from "../src/webMonetizationFaker";
import {
  startMonetization,
  stopMonetization,
} from "../src/webMonetizationHelper";
import { delay, clearDocument, checkEvents } from "./utils";

const paymentPointer = "$custompaymentpointer";

describe("Web Monetization Faker", () => {
  afterEach(() => {
    clearDocument();
  });
  it("Should fake monetization", async () => {
    initFakeMonetization();
    const events = checkEvents();

    startMonetization(paymentPointer);
    await delay(800);
    stopMonetization();
    await delay(100);

    expect(events.monetizationpending).toBe(1);
    expect(events.monetizationstart).toBe(1);
    expect(events.monetizationprogress).toBe(1);
    expect(events.monetizationstop).toBe(1);
  });

  it("Should trigger fail on start", async () => {
    const config = {
      triggerFail: {
        onStart: true,
      },
    };
    initFakeMonetization(config);

    const events = checkEvents();

    startMonetization(paymentPointer);
    await delay(800);
    stopMonetization();
    await delay(100);

    expect(events.monetizationpending).toBe(1);
    expect(events.monetizationstart).toBeUndefined();
    expect(events.monetizationstop).toBe(1);
    expect(events.monetizationprogress).toBeUndefined();
  });

  it("Should trigger fail on progress", async () => {
    const config = {
      triggerFail: {
        onProgress: true,
        timeout: 1500, //3 -1 times Each every 500ms
      },
    };

    initFakeMonetization(config);
    const events = checkEvents();

    startMonetization(paymentPointer);
    await delay(2000);

    expect(events.monetizationpending).toBe(1);
    expect(events.monetizationstart).toBe(1);
    expect(events.monetizationprogress).toBe(2);
  });
});
