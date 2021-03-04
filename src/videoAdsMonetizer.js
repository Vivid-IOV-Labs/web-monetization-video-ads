import { initVideoAdvertizer, stopAds, context } from "./videoAdvertizer";
import { initVideoMonetizer } from "./videoMonetizer";
import { isWebMonetized } from "./webMonetizationHelper";

export const initVideoAdsMonetizer = ({
  videoElement,
  startAdsTime = 1000,
  adsConfig,
  monetizationConfig,
}) => {
  const videoMonetizer = initVideoMonetizer({
    ...monetizationConfig,
    videoElement,
  });

  let videoAdvertizer;

  if (!isWebMonetized()) {
    videoAdvertizer = initVideoAdvertizer({ ...adsConfig, videoElement });
  } else {
    let checkMonetizationRestart = null;

    const attemptAdsStart = () => {
      if (!videoElement.paused) {
        checkMonetizationRestart = setTimeout(() => {
          videoAdvertizer = initVideoAdvertizer({ ...adsConfig, videoElement });
        }, startAdsTime);
      }
    };

    document.monetization.addEventListener("monetizationstop", () => {
      if (!context.hasPlayed) {
        attemptAdsStart();
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
