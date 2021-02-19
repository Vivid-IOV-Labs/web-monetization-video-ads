import { stopMonetization, observeMetaTagMutations } from "./webMonetization";
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
      }, 6000);

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

  document.monetization.addEventListener("monetizationstop", () => {
    clearTimeout(monetizationProgressChecker);
    monetizationStartEventChecker = false;
  });

  const onMetaTagAdded = () => {
    setTimeout(() => {
      if (!monetizationStartEventChecker) {
        dispatchEvent("monetizationstart-error");
        stopMonetization();
      }
    }, 6000);
  };
  observeMetaTagMutations({ onAdded: onMetaTagAdded });
};
