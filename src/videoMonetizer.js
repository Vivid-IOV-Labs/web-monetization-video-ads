import {
  startMonetization,
  stopMonetization,
  isWebMonetized,
} from "./webMonetizationHelper";
import { initFakeMonetization } from "./webMonetizationFaker";
import {
  initMonetizationChecker,
  videoMonetizer,
} from "./webMonetizationChecker";
import { createVanillaPaymentPointer } from "./vanillaVerification";
import { cretatePaymentPointerWithReceipt } from "./receiptVerifier";
import { isInactiveActiveTab } from "./isInactiveActiveTab";

const playPauseVideoHandler = ({ videoElement, paymentPointer }) => {
  videoElement.addEventListener("play", () => {
    if (isWebMonetized()) {
      startMonetization(paymentPointer);
    } else {
      stopMonetization();
    }
  });
  videoElement.addEventListener("pause", () => {
    stopMonetization();
  });
  videoElement.addEventListener("ended", () => {
    stopMonetization();
  });
  videoElement.addEventListener("error", () => {
    stopMonetization();
  });
};

export const initVideoMonetizer = ({
  videoElement,
  paymentPointer,
  stopOnInactiveTab = false,
  vanillaCredentials = { enabled: false },
  receiptVerify = { enabled: false, createCustomPaymentPointer: true },
  fakeMonetization = {
    enabled: false,
  },
}) => {
  if (!paymentPointer && !vanillaCredentials.enabled) {
    throw new Error("No payment poynter");
  }

  if (vanillaCredentials.enabled && receiptVerify.enabled) {
    throw new Error(
      "You can have proof your transaction just using one of these two options: Vanilla.so or Recept Verification Api"
    );
  }

  if (
    vanillaCredentials.enabled &&
    (!vanillaCredentials.clientId || !vanillaCredentials.clientSecret)
  ) {
    throw new Error(
      "You must fill vanillaCredentials with enabeld:Boolean, clientId:String, clientSecret:String"
    );
  }

  if (fakeMonetization.enabled) {
    initFakeMonetization({
      paymentPointer,
      triggerFail: fakeMonetization.triggerFail,
    });
  }

  if (isWebMonetized()) {
    if (stopOnInactiveTab) {
      isInactiveActiveTab((isActive) => {
        if (isActive) {
          videoElement.pause();
        } else {
          videoElement.play();
        }
      });
    }

    initMonetizationChecker({ vanillaCredentials, receiptVerify });
    const { apiUrl } = receiptVerify;
    const paymentPointerWithReceipt =
      receiptVerify.enabled && receiptVerify.withReceiptPaymentPointer
        ? cretatePaymentPointerWithReceipt({ paymentPointer, apiUrl })
        : vanillaCredentials.enabled
        ? createVanillaPaymentPointer(vanillaCredentials.clientId)
        : paymentPointer;

    playPauseVideoHandler({
      videoElement,
      paymentPointer: paymentPointerWithReceipt,
    });
  }

  return {
    emitter: videoMonetizer,
    context: { videoElement, paymentPointer, receiptVerify, fakeMonetization },
  };
};
