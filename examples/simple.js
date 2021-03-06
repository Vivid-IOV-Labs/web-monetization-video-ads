import { initVideoAdsMonetizer } from "./esm/index.js";

// const vanillaCredentials = {
//   enabled: true,
//   clientId: "524d23c6-a0f1-422e-8d20-24dc84d419e6",
//   clientSecret: "oPMA9k+i1jHi45ITXD6Biag+4xF9b7tcHnwnepe3MAA=",
// };

const receiptVerify = {
  enabled: false,
  apiUrl: "https://web-monetization-server-test.herokuapp.com",
  verifyEndPoint: "verifyReceipt",
  createCustomPaymentPointer: false,
  bodyParsed: true,
};

//const paymentPointer = "https://revsharetest.peerkat.live";
const paymentPointer = "$ilp.uphold.com/RzZiPnxpFYf9";

const tagUrl =
  "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator=";

document.addEventListener(
  "DOMContentLoaded",
  function () {
    // const startMonetization = (paymentPointer) => {
    //   const monetizationTag = document.querySelector(
    //     'meta[name="monetization"]'
    //   );
    //   if (!monetizationTag) {
    //     const monetizationTag = document.createElement("meta");
    //     monetizationTag.name = "monetization";
    //     monetizationTag.content = paymentPointer;
    //     document.head.appendChild(monetizationTag);
    //   }
    // };

    // const stopMonetization = () => {
    //   const monetizationTag = document.querySelector(
    //     'meta[name="monetization"]'
    //   );
    //   console.log(monetizationTag);
    //   if (monetizationTag) monetizationTag.remove();
    // };
    // setTimeout(() => {
    //   console.log("start");
    //   startMonetization();
    // }, 4000);
    // setTimeout(() => {
    //   console.log("stop");
    //   stopMonetization();
    // }, 20000);
    const videoElement = document.querySelector("video");

    initVideoAdsMonetizer({
      videoElement,
      monetizationConfig: {
        stopOnInactiveTab: false,
        paymentPointer,
        receiptVerify,
        fakeMonetization: {
          enabled: false,
          triggerFail: {
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
      document.monetization.addEventListener("monetizationpending", (event) => {
        console.log("monetizationpending", event);
      });
      document.monetization.addEventListener(",monetizationstop", (event) => {
        console.log("monetizationstop", event);
      });
      document.monetization.addEventListener(
        "monetizationprogress",
        (event) => {
          console.log("monetizationprogress", event);
        }
      );
      document.monetization.addEventListener("monetizationreceipt", (event) => {
        console.log("monetizationreceipt", event);
      });
      document.monetization.addEventListener(
        "monetizationreceipt-error",
        (event) => {
          console.log("monetizationreceipt-error", event);
        }
      );
    }
  },
  false
);
