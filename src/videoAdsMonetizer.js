import { initVideoAdvertizer, stopAds, context } from "./videoAdvertizer";
import { initVideoMonetizer } from "./videoMonetizer";
import { isWebMonetized } from "./webMonetizationHelper";
import { devLog } from "./devLog";

export const initVideoAdsMonetizer = ({
  videoElement,
  startAdsTime = 6000,
  adsConfig,
  monetizationConfig,
}) => {
  const videoMonetizer = initVideoMonetizer({
    ...monetizationConfig,
    videoElement,
  });

  let videoAdvertizer;

  if (!isWebMonetized()) {
    devLog("not montezied");
    videoAdvertizer = initVideoAdvertizer({ ...adsConfig, videoElement });
  } else {
    let checkMonetizationRestart = null;

    const attemptAdsStart = () => {
      if (!videoElement.paused) {
        checkMonetizationRestart = setTimeout(() => {
          devLog("attempt start");

          videoAdvertizer = initVideoAdvertizer({ ...adsConfig, videoElement });
        }, startAdsTime);
      }
    };
    document.monetization.addEventListener("monetizationprogress-error", () => {
      devLog("monetizationprogress-error");
    });
    document.monetization.addEventListener("monetizationstart-error", () => {
      devLog("monetizationstart-error");
    });
    document.monetization.addEventListener("monetizationstop", () => {
      devLog("monetizationstop");
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
