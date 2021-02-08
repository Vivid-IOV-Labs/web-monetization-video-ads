import { startAds, stopAds, context } from "./videoAdvertizer";
import { initVideoMonetizer } from "./videoMonetizer";
import { initVideoAdsMonetizer } from "./videoAdsMonetizer";

const videoAdvertizer = {
  startAds,
  stopAds,
  context,
};

export { videoAdvertizer, initVideoMonetizer, initVideoAdsMonetizer };
