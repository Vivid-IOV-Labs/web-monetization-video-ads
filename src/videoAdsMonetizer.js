import { startAds, stopAds, context } from "./videoAdvertizer";
import { initVideoMonetizer } from "./videoMonetizer";
import { isWebMonetized } from "./webMonetization";

export const initVideoAdsMonetizer = ({
  videoElement,
  adsConfig,
  monetizationConfig,
}) => {
  const {
    paymentPointer,
    vanillaCredentials,
    receiptVerify,
    fakeMonetization = false,
  } = monetizationConfig;
  const { tagUrl, live, interval } = adsConfig;

  const videoMonetizer = initVideoMonetizer({
    paymentPointer,
    videoElement,
    vanillaCredentials,
    receiptVerify,
    dev: fakeMonetization,
  });

  if (!isWebMonetized()) {
    startAds({ videoElement, tagUrl, live, interval });
  } else {
    let checkMonetizationRestart = null;

    document.monetization.addEventListener("monetizationstop", () => {
      if (!videoElement.paused) {
        checkMonetizationRestart = setTimeout(() => {
          startAds({ videoElement, tagUrl, live, interval });
        }, 2000);
      }
    });

    document.monetization.addEventListener("monetizationprogress", () => {
      if (checkMonetizationRestart) {
        clearTimeout(checkMonetizationRestart);
      }
      if (context.hasPlayed) {
        stopAds();
      }
    });
  }
  return { videoMonetizer };
};
