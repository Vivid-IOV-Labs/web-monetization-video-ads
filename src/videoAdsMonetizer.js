import { initVideoAdvertizer, stopAds, context } from "./videoAdvertizer";
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
    videoAdvertizer = initVideoAdvertizer({ ...adsConfig, videoElement });
  } else {
    let checkMonetizationRestart = null;

    const attemptAdsStart = () => {
      if (!videoElement.paused) {
        // console.log("attempetAds");
        checkMonetizationRestart = setTimeout(() => {
          videoAdvertizer = initVideoAdvertizer({ ...adsConfig, videoElement });
          // console.log("startAds", videoAdvertizer);
        }, startAdsTime);
      }
    };

    document.monetization.addEventListener("monetizationstop", (event) => {
      // console.log("monetizationstop", event);

      attemptAdsStart();
    });
    document.monetization.addEventListener("monetizationstart-error", () => {
      console.log("monetizationstart-error");
      attemptAdsStart();
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
