import { startAds, stopAds, context } from "./videoAdvertizer";
import { initVideoMonetizer } from "./videoMonetizer";
import { isWebMonetized } from "./webMonetizationHelper";

export const initVideoAdsMonetizer = ({
  videoElement,
  startAdsTime = 3000,
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

    const attemptAdsStart = () => {
      if (!videoElement.paused) {
        checkMonetizationRestart = setTimeout(() => {
          videoAdvertizer = startAds({ ...adsConfig, videoElement });
        }, startAdsTime);
      }
    };

    document.monetization.addEventListener("monetizationstop", attemptAdsStart);
    document.monetization.addEventListener(
      "monetizationstart-error",
      attemptAdsStart
    );

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
