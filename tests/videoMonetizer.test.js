import { initVideoMonetizer } from "../src/videoMonetizer";
import { getPointerFromMetaTag } from "../src/webMonetizationHelper";
import { htmlMediaMock } from "./htmlMediaMock";
import * as receipt from "../src/receiptVerifier";
import * as vanilla from "../src/vanillaVerification";
import * as faker from "../src/webMonetizationFaker";
import * as checker from "../src/webMonetizationChecker";
import * as inactive from "../src/isInactiveActiveTab";

const paymentPointer = "$custompaymentpointer";

describe("Video Monetizer", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  htmlMediaMock();
  it("Should start/stop monetize on play/pause", () => {
    document.body.innerHTML = `
        <video id="video-element"></video>
      `;
    const videoElement = document.getElementById("video-element");

    initVideoMonetizer({
      videoElement,
      paymentPointer,
      fakeMonetization: {
        enabled: true,
      },
    });
    videoElement.play();
    expect(getPointerFromMetaTag()).toBe(paymentPointer);
    videoElement.pause();
    expect(getPointerFromMetaTag()).toBe(null);
  });
  it("Should initialize faker checker inactivetab vanillaverification", async () => {
    const spyFaker = jest.spyOn(faker, "initFakeMonetization");
    const spyChecker = jest.spyOn(checker, "initMonetizationChecker");
    const spyInactiveTab = jest.spyOn(inactive, "isInactiveActiveTab");
    const spyVanillaCreatePaymentPointer = jest.spyOn(
      vanilla,
      "createVanillaPaymentPointer"
    );
    const spyReceiptreatePaymentPointer = jest.spyOn(
      receipt,
      "cretatePaymentPointerWithReceipt"
    );

    document.body.innerHTML = `
    <video id="video-element"></video>
  `;
    const videoElement = document.getElementById("video-element");
    const fakerConfig = {
      triggerFail: {
        onStart: true,
      },
    };
    initVideoMonetizer({
      videoElement,
      paymentPointer,
      stopOnInactiveTab: true,
      vanillaCredentials: {
        enabled: true,
        clientId: "xxxx",
        clientSecret: "xxxx",
      },
      fakeMonetization: {
        enabled: true,
        fakerConfig,
      },
    });
    expect(spyInactiveTab).toHaveBeenCalled();
    expect(spyFaker).toHaveBeenCalled();
    expect(spyChecker).toHaveBeenCalled();
    expect(spyVanillaCreatePaymentPointer).toHaveBeenCalled();
    expect(spyReceiptreatePaymentPointer).not.toHaveBeenCalled();
  });
  it("Should initialize faker receipt checker", async () => {
    const spyFaker = jest.spyOn(faker, "initFakeMonetization");
    const spyChecker = jest.spyOn(checker, "initMonetizationChecker");
    const spyInactiveTab = jest.spyOn(inactive, "isInactiveActiveTab");
    const spyVanillaCreatePaymentPointer = jest.spyOn(
      vanilla,
      "createVanillaPaymentPointer"
    );
    const spyReceiptreatePaymentPointer = jest.spyOn(
      receipt,
      "cretatePaymentPointerWithReceipt"
    );

    document.body.innerHTML = `
    <video id="video-element"></video>
  `;
    const videoElement = document.getElementById("video-element");
    initVideoMonetizer({
      videoElement,
      paymentPointer,
      receiptVerify: {
        enabled: true,
        withReceiptPaymentPointer: true,
      },
      fakeMonetization: {
        enabled: true,
      },
    });
    expect(spyInactiveTab).not.toHaveBeenCalled();
    expect(spyFaker).toHaveBeenCalled();
    expect(spyChecker).toHaveBeenCalled();
    expect(spyVanillaCreatePaymentPointer).not.toHaveBeenCalled();
    expect(spyReceiptreatePaymentPointer).toHaveBeenCalled();
  });
});
