import {
  startMonetization,
  stopMonetization,
  isWebMonetized,
} from "./webMonetization";
import { initFakeMonetization } from "./webMonetizationMock";
import {
  createVanillaPaymentPointer,
  getContentProof,
} from "./vanillaVerification";
import {
  cretatePaymentPointerWithReceipt,
  verifyReceipt,
} from "./receiptVerifier";

/**
 * Events
monetizationstart-error
monetizationprogress-error

monetizationproof
monetizationproof-error

monetizationreceipt
monetizationreceipt-error

monetizationpaused
 */

const videoMonetizer = new EventTarget();

const dispatchEvent = (name, payload = null) => {
  const event = new CustomEvent(name, { detail: payload });
  videoMonetizer.dispatchEvent(event);
};

const monetizationChecker = ({
  videoElement,
  vanillaCredentials,
  receiptVerify,
}) => {
  let monetizationStartEventChecker = false;
  let monetizationProgressChecker;

  document.monetization.addEventListener("monetizationstart", () => {
    monetizationStartEventChecker = true;
  });

  document.monetization.addEventListener(
    "monetizationprogress",
    ({ detail: { receipt, requestId } }) => {
      clearTimeout(monetizationProgressChecker);
      monetizationProgressChecker = setTimeout(() => {
        dispatchEvent("monetizationprogress-error");
        stopMonetization();
      }, 3000);

      if (vanillaCredentials.enabled) {
        const { clientSecret, clientId } = vanillaCredentials;
        getContentProof({ clientId, clientSecret, requestId })
          .then((response) => response.json())
          .then(({ data: { proof } }) => {
            dispatchEvent("monetizationproof", proof);
          })
          .catch((error) => {
            dispatchEvent("monetizationproof-error", error);
            stopMonetization();
          });
      }

      if (receiptVerify.enabled) {
        const { verifyEndPoint, apiUrl } = receiptVerify;
        verifyReceipt({ receipt, verifyEndPoint, apiUrl })
          .then((response) => response.json())
          .then((data) => {
            dispatchEvent("monetizationreceipt", data);
          })
          .catch((error) => {
            dispatchEvent("monetizationreceipt-error", error);
            stopMonetization();
          });
      }
    }
  );

  document.monetization.addEventListener("monetizationstop", () => {
    clearTimeout(monetizationProgressChecker);
  });

  videoElement.addEventListener(
    "play",
    () => {
      setTimeout(() => {
        if (!monetizationStartEventChecker) {
          dispatchEvent("monetizationstart-error");
          stopMonetization();
        }
      }, 6000);
    },
    { once: true }
  );
};

const isActiveTab = function (handleVisibilityChange) {
  var hidden, visibilityChange;
  if (typeof document.hidden !== "undefined") {
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }
  function handler() {
    handleVisibilityChange(document[hidden]);
  }
  if (
    typeof document.addEventListener === "undefined" ||
    hidden === undefined
  ) {
    throw new Error("Visibility Api not enabled");
  } else {
    document.addEventListener(visibilityChange, handler, false);
  }
};

const playPauseVideoHandler = ({ videoElement, paymentPointer }) => {
  videoElement.addEventListener("play", () => {
    startMonetization(paymentPointer);
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

const noWebMonetizationHandler = () => {
  dispatchEvent("monetization-not-enabled");
};

export const initVideoMonetizer = ({
  videoElement,
  paymentPointer,
  vanillaCredentials = { enabled: false, clientId: null, clientSecret: null },
  receiptVerify = { enabled: false, apiUrl: null, verifyEndPoint: null },
  fakeMonetization = false,
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
  if (!isWebMonetized()) {
    noWebMonetizationHandler();
  } else {
    dispatchEvent("monetization-enabled");

    isActiveTab((isActive) => {
      if (!isActive) {
        dispatchEvent("monetizationpaused");
      }
    });

    if (fakeMonetization) {
      initFakeMonetization(paymentPointer);
    }
    monetizationChecker({ videoElement, vanillaCredentials, receiptVerify });

    const { apiUrl } = receiptVerify;
    const paymentPointerWithReceipt = receiptVerify.enabled
      ? cretatePaymentPointerWithReceipt({ paymentPointer, apiUrl })
      : vanillaCredentials.enabled
      ? createVanillaPaymentPointer(vanillaCredentials.clientId)
      : paymentPointer;

    playPauseVideoHandler({
      videoElement,
      paymentPointer: paymentPointerWithReceipt,
    });
  }

  return videoMonetizer;
};
