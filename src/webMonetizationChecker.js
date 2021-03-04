import {
  stopMonetization,
  observeMetaTagMutations,
} from "./webMonetizationHelper";
import { getContentProof } from "./vanillaVerification";
import { verifyReceipt } from "./receiptVerifier";

/**
   * Events
  monetizationstart-error
  monetizationprogress-error
  
  monetizationproof
  monetizationproof-error
  
  monetizationreceipt
  monetizationreceipt-error
   */

export const videoMonetizer = new EventTarget();

const dispatchEvent = (name, payload = null) => {
  const event = new CustomEvent(name, { detail: payload });
  videoMonetizer.dispatchEvent(event);
  /**
   * Extends to document monetization
   */
  if (document.monetization) document.monetization.dispatchEvent(event);
};

export const initMonetizationChecker = ({
  vanillaCredentials = { enabled: false, clientId: null, clientSecret: null },
  receiptVerify = {
    enabled: false,
    apiUrl: null,
    verifyEndPoint: null,
    createCustomPaymentPointer: true,
    bodyParsed: true,
  },
  progressErrorWatitingTime = 6000,
  startErrorWaitingTime = 8000,
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
      }, progressErrorWatitingTime);

      if (vanillaCredentials.enabled) {
        const { clientSecret, clientId } = vanillaCredentials;
        getContentProof({ clientId, clientSecret, requestId })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error(response);
            }
          })
          .then(({ data: { proof } }) => {
            dispatchEvent("monetizationproof", proof);
          })
          .catch((error) => {
            dispatchEvent("monetizationproof-error", error);
          });
      }

      if (receiptVerify.enabled) {
        const { verifyEndPoint, apiUrl, bodyParsed } = receiptVerify;
        verifyReceipt({ receipt, verifyEndPoint, apiUrl, bodyParsed })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error(response);
            }
          })
          .then((data) => {
            dispatchEvent("monetizationreceipt", data);
          })
          .catch((error) => {
            dispatchEvent("monetizationreceipt-error", error);
          });
      }
    }
  );

  document.monetization.addEventListener("monetizationstart-error", () => {
    const event = new Event("monetizationstop");
    document.monetization.dispatchEvent(event);
    metaTagObserver.disconnect();
  });

  document.monetization.addEventListener("monetizationstop", () => {
    clearTimeout(monetizationProgressChecker);
    monetizationStartEventChecker = false;
  });

  const onMetaTagAdded = () => {
    setTimeout(() => {
      if (!monetizationStartEventChecker) {
        dispatchEvent("monetizationstart-error");
      }
    }, startErrorWaitingTime);
  };
  const metaTagObserver = observeMetaTagMutations({ onAdded: onMetaTagAdded });

  return {
    vanillaCredentials,
    receiptVerify,
    progressErrorWatitingTime,
    startErrorWaitingTime,
  };
};
