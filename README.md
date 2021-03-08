# Web Monetization Video Ads

Web Monetization Video Ads is a `utility` that allows you to `monetize videos`.
It uses web monetization when available and loads ads as a fallback.

## Installing
```
npm install web-monetization-video-ads --save
```
## Set Up and Usage

The package exposes 3 submodules:

-  `initVideoMonetizer` for monetize the video element usign [web monetization API](https://webmonetization.org/).

-  `initVideoAdvertizer` a wrapper around [IMA SDK](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side), used for advertizing.

-  `initVideoAdsMonetizer` includes both of the submodules to provide web monetization and advertizing as a fallback.

### Simple

For the bare minimum set up, import`initVideoAdsMonetizer` and pass some configurations as follow:

```
import { initVideoAdsMonetizer } from "web-monetization-video-ads";

const paymentPointer = "$your-paymentpointer";

const tagUrl ="your-custom-tag-url";

const videoElement = document.querySelector("#video-to-monetize");

const config = {
	videoElement,
	monetizationConfig: {
		paymentPointer,
	},
	adsConfig: {
		tagUrl,
	},
};

const videoAdvertizer = initVideoAdsMonetizer(config);
```
-  `videoElement`  The video element you want to monetize. At this moment the library supports just one videoElement per page. You must wrap the video with a container with no other child elements in it. The container is crucial to make your [video responsive](https://css-tricks.com/fluid-width-video/)  and it’s something something out of the scope of this library. 

-  `monetizationConfig` Used by `initVideoMonetizer` for monetize.

-  `adsConfig` Used by `initVideoAdvertizer` for initializing and loading ads.
- `startAdsTime (dedfault = 4000)` Waiting time before attempting to initialize the advertising.

Launches `initVideoAdvertizer` when `document.monetization` is not present in the page or some `monetization errors` occured and runs `initVideoMonetizer`in the other case.

### Others Modules In Depth

#### initVideoMonetizer

It's main purpose is to start and stop web monetization whenever a video is playing or pausing.
```
import { initVideoMonetizer } from "web-monetization-video-ads";

const monetizationConfig = {
	paymentPointer,
	stopOnInactiveTab: false,
	receiptVerify:{
		enabled: false,
		apiUrl: "xxxxxx",
		verifyEndPoint: "xxxx",
		createCustomPaymentPointer: true,
		bodyParsed: true,
	},
	vanillaCredentials = {
		enabled: false,
		clientId: "xxxxxx",
		clientSecret: "xxxxx",
	};
	fakeMonetization: {
		enabled: false,
		triggerFail: {
			onStart: false,
			onProgress: false,
			timeout: 6000,
		},
	},
};

const videoMonetizer = initVideoMonetizer(monetizationConfig);
```
This modules includes some functionalities and helper functions for the web monetization.

-  `paymentPointer` your custom payment pointer
-  `receiptVerify` it follows the [receipt verifier api standards](https://webmonetization.org/docs/receipt-verifier) to provide a verfification. If you enabled it with no other configuration it will uses `$webmonetization.org/api/receipts` url as default. You can override it, with your custom `sps url`, through`apiUrl` and `verifyEndPoint`. If`createCustomPaymentPointer` is set to true, it will format the `paymentPointer` as showed in the web monetization api documentation.
If`bodyParsed` is set to true will parse the `receipt` as an object property of the body call, conversely will pass it as a string.
-  `vanillaCredentials` you can enable [vanilla verification](https://vanilla.so/) using this configuration and passing a client and a secret key.
-  `fakeMonetization`if enabled will fake the monetization for `developing` or `testing` mode. Within `triggerFail` you can fake a `monetizationstart-error`  event by setting `onStart` to true and a `monetizationprogress-error` event with `onProgress` set on true and  `timeout` for specifying in millisecond when to trigger it.

More on its internal functionalities.
`webMonetizationChecker.js` extends the web monetization with the following events listeners:
-`monetizationstart-error` uses the same technique in [https://testwebmonetization.com/](https://testwebmonetization.com/) for detecting when monetization doesn't start after `startErrorWaitingTime (default = 8000) ` ,
-`monetizationprogress-error`  dispatched when `monetizationprogress` is not occurring after `progressErrorWatitingTime (default = 6000) `
-`monetizationreceipt`  and `monetizationreceipt-error` when `receiptVerification` response returns 
-`monetizationproof`  and `monetizationproof-error` when `vanillaVerification` response returns  

###### Example usage 
```
document.monetization.addEventListener("monetizationstart-error", function(){
	console.log("Monetization start event not occurred");
});
```
`webMonetizationFaker.js`used also in test for mocking the web monetization api.

#### initVideoAdvertizer

It  initializing and playing the ads and also exposes`stopAds` for stopping them when needed.
```
import { initVideoAdvertizer } from "web-monetization-video-ads";

const adsConfig = {
	tagUrl,
	live:false,
	interval:30
},  

const videoAdvertizer = initVideoAdvertizer(adsConfig);
```
-  `tagUrl` for monetize the video element usign web monetization API.

-  `live` a wrapper around [IMA SDK](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side), used for advertizing.

-  `interval` includes both of the submodules to provide web monetization and

## Issues
- Mobile or MultiVideos are not yet supported or tested. 
## License

This project uses the following license: [MIT License](https://github.com/Vivid-IOV-Labs/web-monetisation-video-ads/blob/main/LICENSE.md).