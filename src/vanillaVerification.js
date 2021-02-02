const CLIENT_ID = "524d23c6-a0f1-422e-8d20-24dc84d419e6";
const CLIENT_SECRET = "oPMA9k+i1jHi45ITXD6Biag+4xF9b7tcHnwnepe3MAA=";
const VANILLA_API_URL = "https://wm.vanilla.so/graphql";
const paymentPointer = "$wm.vanilla.so/pay/524d23c6-a0f1-422e-8d20-24dc84d419e6";

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
}`

export const createVanillaPaymentPointer = (clientId) => {
  return "$wm.vanilla.so/pay/" + clientId
}

export const getContentProof = ({ requestId, clientId, clientSecret }) => {
  return fetch(VANILLA_API_URL, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
    },
    body: JSON.stringify({
      query: getProofQuery(requestId)
    }),
  })

}
