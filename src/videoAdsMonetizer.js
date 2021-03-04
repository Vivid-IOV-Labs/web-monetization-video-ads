import { initVideoAdvertizer, stopAds, context } from "./videoAdvertizer";
import { initVideoMonetizer } from "./videoMonetizer";
import { isWebMonetized } from "./webMonetizationHelper";

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
    console.log("not montezied");
    videoAdvertizer = initVideoAdvertizer({ ...adsConfig, videoElement });
  } else {
    let checkMonetizationRestart = null;

    const attemptAdsStart = () => {
      if (!videoElement.paused) {
        checkMonetizationRestart = setTimeout(() => {
          // videoElement.pause();
          videoAdvertizer = initVideoAdvertizer({ ...adsConfig, videoElement });
        }, startAdsTime);
      }
    };
    document.monetization.addEventListener("monetizationprogress-error", () => {
      console.log("monetizationprogress-error");
    });
    document.monetization.addEventListener("monetizationstart-error", () => {
      console.log("monetizationstart-error");
    });
    document.monetization.addEventListener("monetizationstop", () => {
      console.log("monetizationstop");
      if (context.status !== "alladscompleted") {
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
