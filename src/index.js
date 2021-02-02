import { startAds, stopAds, context, videoAdvertizer as emitter } from "./videoAdvertizer";
import { initVideoMonetizer } from "./videoMonetizer";
import { initVideoAdsMonetizer } from "./videoAdsMonetizer";


const videoAdvertizer = {
  startAds, stopAds, context, emitter
}
export {
  videoAdvertizer,
  initVideoMonetizer,
  initVideoAdsMonetizer
}