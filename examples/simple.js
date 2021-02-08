import { initVideoAdsMonetizer } from "./esm/index.js";

// const vanillaCredentials = {
//   enabled: true,
//   clientId: "524d23c6-a0f1-422e-8d20-24dc84d419e6",
//   clientSecret: "oPMA9k+i1jHi45ITXD6Biag+4xF9b7tcHnwnepe3MAA=",
// };

const receiptVerify = {
  enabled: true,
  apiUrl: "https://web-monetization-server-test.herokuapp.com",
  verifyEndPoint: "verifyReceipt",
  createCustomPaymentPointer: false,
};

//const paymentPointer = "$ilp.uphold.com/RzZiPnxpFYf9";
const paymentPointer = "https://web-monetization-server-test.herokuapp.com";
const tagUrl =
  "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator=";
const videoElement = document.querySelector("video");

initVideoAdsMonetizer({
  videoElement,
  monetizationConfig: {
    paymentPointer,
    fakeMonetization: {
      enabled: true,
      triggerFail: {
        enabled: true,
        onStart: false,
        onProgress: true,
        timeout: 6000,
      },
    },
  },
  adsConfig: {
    tagUrl,
    live: true,
  },
});

if (document.monetization) {
  document.monetization.addEventListener("monetizationstart", () => {
    console.log("monetizationstart");
  });
  document.monetization.addEventListener("monetizationpending", () => {
    console.log("monetizationpending");
  });
  document.monetization.addEventListener("monetizationstop", () => {
    console.log("monetizationstop");
  });
  document.monetization.addEventListener("monetizationprogress", () => {
    console.log("monetizationprogress");
  });
}
