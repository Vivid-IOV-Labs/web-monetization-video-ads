import {
  // stopMonetization,
  observeMetaTagMutations,
} from "./webMonetizationHelper";
import { getContentProof } from "./vanillaVerification";
import { verifyReceipt } from "./receiptVerifier";
import { EventTarget, Event } from "event-target-shim";

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
  const event = new Event(name, { detail: payload });
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
  let monetizationStartTimeChecker;
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
        clearTimeout(monetizationProgressChecker);
        clearTimeout(monetizationStartTimeChecker);
        monetizationStartEventChecker = false;
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
    clearTimeout(monetizationProgressChecker);
    clearTimeout(monetizationStartTimeChecker);
    monetizationStartEventChecker = false;
  });

  const onMetaTagAdded = () => {
    monetizationStartTimeChecker = setTimeout(() => {
      if (!monetizationStartEventChecker) {
        dispatchEvent("monetizationstart-error");
      }
    }, startErrorWaitingTime);
  };
  const onMetaTagRemoved = () => {
    clearTimeout(monetizationProgressChecker);
    clearTimeout(monetizationStartTimeChecker);
    monetizationStartEventChecker = false;
  };
  observeMetaTagMutations({
    onAdded: onMetaTagAdded,
    onRemoved: onMetaTagRemoved,
  });

  return {
    vanillaCredentials,
    receiptVerify,
    progressErrorWatitingTime,
    startErrorWaitingTime,
  };
};
