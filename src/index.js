import { initVideoAdvertizer, stopAds, context } from "./videoAdvertizer";
import { initVideoMonetizer } from "./videoMonetizer";
import { initVideoAdsMonetizer } from "./videoAdsMonetizer";

const videoAdvertizer = {
  initVideoAdvertizer,
  stopAds,
  context,
};

export { videoAdvertizer, initVideoMonetizer, initVideoAdsMonetizer };
