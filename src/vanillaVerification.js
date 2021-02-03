const VANILLA_API_URL = "https://wm.vanilla.so/graphql";

const getProofQuery = (requestId) => `
{
    proof(requestId: "${requestId}") {
        total  
        rate
        metadata{
          requestId
          clientId
          contentId
        }
    }
}`;

export const createVanillaPaymentPointer = (clientId) => {
  return "$wm.vanilla.so/pay/" + clientId;
};

export const getContentProof = ({ requestId, clientId, clientSecret }) => {
  return fetch(VANILLA_API_URL, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: JSON.stringify({
      query: getProofQuery(requestId),
    }),
  });
};
