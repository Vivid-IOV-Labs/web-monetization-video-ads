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
    fakeMonetization,
  } = monetizationConfig;
  const { tagUrl, live, interval } = adsConfig;

  const videoMonetizer = initVideoMonetizer({
    paymentPointer,
    videoElement,
    vanillaCredentials,
    receiptVerify,
    fakeMonetization,
  });

  let videoAdvertizer;

  if (!isWebMonetized()) {
    videoAdvertizer = startAds({ videoElement, tagUrl, live, interval });
  } else {
    let checkMonetizationRestart = null;

    document.monetization.addEventListener("monetizationstop", () => {
      if (!videoElement.paused) {
        checkMonetizationRestart = setTimeout(() => {
          videoAdvertizer = startAds({ videoElement, tagUrl, live, interval });
        }, 8000);
      }
    });

    document.monetization.addEventListener("monetizationstart-error", () => {
      if (!videoElement.paused) {
        checkMonetizationRestart = setTimeout(() => {
          videoAdvertizer = startAds({ videoElement, tagUrl, live, interval });
        }, 8000);
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

  return { videoMonetizer, videoAdvertizer };
};
