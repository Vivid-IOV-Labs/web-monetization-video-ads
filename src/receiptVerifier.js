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
}) => {
  const url = `${apiUrl}/${verifyEndPoint}`;
  return fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: receipt,
  });
};
