import { initVideoAdvertizer, stopAds, context } from "./videoAdvertizer";
import { initVideoMonetizer } from "./videoMonetizer";
import { initVideoAdsMonetizer } from "./videoAdsMonetizer";
import "custom-event-polyfill";
const videoAdvertizer = {
  initVideoAdvertizer,
  stopAds,
  context,
};

export { videoAdvertizer, initVideoMonetizer, initVideoAdsMonetizer };
