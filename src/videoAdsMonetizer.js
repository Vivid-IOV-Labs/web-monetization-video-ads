import { startAds, stopAds, context } from "./videoAdvertizer";
import { initVideoMonetizer } from "./videoMonetizer";
import { isWebMonetized } from "./webMonetizationHelper";

export const initVideoAdsMonetizer = ({
  videoElement,
  startAdsTime = 4000,
  adsConfig,
  monetizationConfig,
}) => {
  const videoMonetizer = initVideoMonetizer({
    ...monetizationConfig,
    videoElement,
  });

  let videoAdvertizer;

  if (!isWebMonetized()) {
    videoAdvertizer = startAds({ ...adsConfig, videoElement });
  } else {
    let checkMonetizationRestart = null;

    document.monetization.addEventListener("monetizationstop", () => {
      if (!videoElement.paused) {
        checkMonetizationRestart = setTimeout(() => {
          videoAdvertizer = startAds({ ...adsConfig, videoElement });
        }, startAdsTime);
      }
    });

    document.monetization.addEventListener("monetizationstart-error", () => {
      if (!videoElement.paused) {
        checkMonetizationRestart = setTimeout(() => {
          videoAdvertizer = startAds({ ...adsConfig, videoElement });
        }, startAdsTime);
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
