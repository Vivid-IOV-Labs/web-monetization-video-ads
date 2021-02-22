import {
  startMonetization,
  stopMonetization,
  isWebMonetized,
} from "./webMonetization";
import { initFakeMonetization } from "./webMonetizationMock";
import {
  initMonetizationChecker,
  videoMonetizer,
} from "./webMonetizationChecker";
import { createVanillaPaymentPointer } from "./vanillaVerification";
import { cretatePaymentPointerWithReceipt } from "./receiptVerifier";

// const isActiveTab = function (handleVisibilityChange) {
//   var hidden, visibilityChange;
//   if (typeof document.hidden !== "undefined") {
//     hidden = "hidden";
//     visibilityChange = "visibilitychange";
//   } else if (typeof document.msHidden !== "undefined") {
//     hidden = "msHidden";
//     visibilityChange = "msvisibilitychange";
//   } else if (typeof document.webkitHidden !== "undefined") {
//     hidden = "webkitHidden";
//     visibilityChange = "webkitvisibilitychange";
//   }
//   function handler() {
//     handleVisibilityChange(document[hidden]);
//   }
//   if (
//     typeof document.addEventListener === "undefined" ||
//     hidden === undefined
//   ) {
//     throw new Error("Page Visibility API not enabled");
//   } else {
//     document.addEventListener(visibilityChange, handler, false);
//   }
// };

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
  vanillaCredentials,
  receiptVerify,
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
    // isActiveTab((isActive) => {
    //   if (isActive) {
    //     startMonetization();
    //   } else {
    //     stopMonetization();
    //   }
    // });

    initMonetizationChecker({ vanillaCredentials, receiptVerify });

    const { apiUrl } = receiptVerify;
    const paymentPointerWithReceipt =
      receiptVerify.enabled && receiptVerify.createCustomPaymentPointer
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
