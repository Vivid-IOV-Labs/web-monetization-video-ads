import { initVideoAdsMonetizer } from "./esm/index.js";

const paymentPointer = "$custom-paymentpointer";

const tagUrl =
  "https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator=";

document.addEventListener(
  "DOMContentLoaded",
  function () {
    const videoElement = document.querySelector("video");
    videoElement.addEventListener("ended", function () {
      videoElement.play();
    });
    initVideoAdsMonetizer({
      videoElement,
      monetizationConfig: {
        stopOnInactiveTab: false,
        paymentPointer,
        fakeMonetization: {
          enabled: true,
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
      document.monetization.addEventListener(
        "monetizationprogress-error",
        (event) => {
          console.log("monetizationprogress-error", event);
        }
      );
      document.monetization.addEventListener(
        "monetizationstart-error",
        (event) => {
          console.log("monetizationstart-error", event);
        }
      );
      document.monetization.addEventListener(
        "monetizationreceipt-error",
        (event) => {
          console.log("monetizationreceipt-error", event);
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
