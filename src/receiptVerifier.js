const RECEIPT_API_URL = "https://webmonetization.org/api/receipts";

export const cretatePaymentPointerWithReceipt = ({
  paymentPointer,
  apiUrl = RECEIPT_API_URL,
}) => {
  const newPaymentPointer = apiUrl + "/" + encodeURIComponent(paymentPointer);
  return newPaymentPointer;
};

export const verifyReceipt = ({
  receipt,
  apiUrl = RECEIPT_API_URL,
  verifyEndPoint = "verify",
  bodyParsed = true,
}) => {
  const url = `${apiUrl}/${verifyEndPoint}`;
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: bodyParsed
      ? JSON.stringify({
          receipt,
        })
      : receipt,
  });
};
