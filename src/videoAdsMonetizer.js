import { initVideoAdvertizer, stopAds, context } from "./videoAdvertizer";
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
    videoAdvertizer = initVideoAdvertizer({ ...adsConfig, videoElement });
  } else {
    let checkMonetizationRestart = null;
    let attemptOccurred = false;
    const attemptAdsStart = () => {
      if (!videoElement.paused && !attemptOccurred) {
        checkMonetizationRestart = setTimeout(() => {
          videoAdvertizer = initVideoAdvertizer({ ...adsConfig, videoElement });
          attemptOccurred = true;
        }, startAdsTime);
      }
    };
    document.monetization.addEventListener("monetizationprogress-error", () => {
      attemptAdsStart();
    });
    document.monetization.addEventListener("monetizationstart-error", () => {
      attemptAdsStart();
    });
    document.monetization.addEventListener("monetizationstop", () => {
      videoElement.pause();
    });

    document.monetization.addEventListener("monetizationprogress", () => {
      if (checkMonetizationRestart) {
        clearTimeout(checkMonetizationRestart);
      }
      if (context.hasPlayed) {
        stopAds();
      }
    });
    document.monetization.addEventListener("monetizationstart", () => {
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
