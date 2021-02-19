import { initFakeMonetization } from "../src/webMonetizationMock";
import { startMonetization, stopMonetization } from "../src/webMonetization";

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

const checkEvents = () => {
  const events = {};
  function handler({ type }) {
    if (events[type]) {
      events[type] += 1;
    } else {
      events[type] = 1;
    }
    return events;
  }
  document.monetization.addEventListener("monetizationpending", handler);
  document.monetization.addEventListener("monetizationstart", handler);
  document.monetization.addEventListener("monetizationprogress", handler);
  document.monetization.addEventListener("monetizationstop", handler);
  return events;
};

const clearDocument = () => {
  document.getElementsByTagName("html")[0].innerHTML = "";
};

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
