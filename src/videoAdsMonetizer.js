import { initVideoAdvertizer } from "./videoAdvertizer";
import { initVideoMonetizer } from "./videoMonetizer";
import { isWebMonetized } from "./webMonetizationHelper";

export const initVideoAdsMonetizer = async ({
  videoElement,
  startAdsTime = 4000,
  adsConfig,
  monetizationConfig,
}) => {
  const videoMonetizer = initVideoMonetizer({
    ...monetizationConfig,
    videoElement,
  });

  const videoAdvertizer = await initVideoAdvertizer({
    ...adsConfig,
    videoElement,
  });

  const { startAds, stopAds, context } = videoAdvertizer;

  if (!isWebMonetized()) {
    startAds();
    console.log("start ads");
  } else {
    let checkMonetizationRestart = null;
    let attemptOccurred = false;
    const attemptAdsStart = () => {
      if (!videoElement.paused && !attemptOccurred) {
        checkMonetizationRestart = setTimeout(() => {
          startAds();
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
