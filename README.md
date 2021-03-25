# Web Monetization Video Ads

Web Monetization Video Ads is a `utility` that allows you to `monetize videos`.
It uses web monetization when available and loads ads as a fallback.

## Installing
```
npm install web-monetization-video-ads --save
```
## Set Up and Usage

The package exposes 3 functions:


-  `initVideoMonetizer` for monetize the video element using [web monetization API](https://webmonetization.org/).

-  `initVideoAdvertizer` a wrapper around [IMA SDK](https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side), used for advertising.

-  `initVideoAdsMonetizer` includes both of the sub modules to provide web monetization and advertising as a fallback.

### Simple
For the bare minimum set up, import`initVideoAdsMonetizer` and pass some configurations as follow:
```
import { initVideoAdsMonetizer } from "web-monetization-video-ads";

const paymentPointer = "$your.paymentpointer.com";

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
	startAdsTime:4000  
};

const videoAdvertizer = initVideoAdsMonetizer(config);
```
##### Config
-  `videoElement`  The video element you want to monetize. At this moment the library supports just one videoElement per page. You must wrap the video with a container with no other child elements in it. The container is crucial to make your video responsive, please see an example [here](https://css-tricks.com/fluid-width-video/) . 
-  `monetizationConfig` Used by `initVideoMonetizer` for monetizing.
-  `adsConfig` Used by `initVideoAdvertizer` for initializing and loading ads.
- `startAdsTime (default = 4000)` Waiting time before attempting to initialize the advertising.

##### What it does
Launches `initVideoAdvertizer` when `document.monetization` is not present in the page or if any `monetization errors` occur.  In all other cases it runs `initVideoMonetizer`.

 The `videoElement` is paused on every `monetizationstop` event.

### Sub Modules

#### VideoMonetizer

It's main purpose is to start and stop web monetization whenever a video is playing or has been paused.
```
import { initVideoMonetizer } from "web-monetization-video-ads";

const monetizationConfig = {
	paymentPointer,
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

##### Config
-  `paymentPointer` your custom payment pointer
-  `receiptVerify` it follows the [receipt verifier api standards](https://webmonetization.org/docs/receipt-verifier) to provide verification.
	- `apiUrl (default=$webmonetization.org/api/receipts`)  your custom verification url
	- `verifyEndPoint (default='verify') `  your custom verification endpoint
	 - If `createCustomPaymentPointer (default=false)` is set to true, it will format the `paymentPointer` as showed in the web monetization api documentation.
	- If `bodyParsed (default=true)` is set to true will parse the `receipt` as an object property of the body call, conversely will pass it as a string.
- Alternatively to verify receipts you can also use [vanilla.so](https://vanilla.so/) , by enabling  `vanillaCredentials` .
	- `clientId` your vanilla id
	- `clientSecret` your vanilla secret key
-  `fakeMonetization` This can be used to mock web monetization events, when developing or testing.
	- Within `triggerFail`  you can force web monetization error events
		- `onStart (default=false)` set to true will trigger a `monetizationstart-error`  
		- `onProgress (default=false)` set to true will trigger  `monetizationprogress-error` 
		- `timeout (default=6000)` for specifying in millisecond when to trigger  `monetizationprogress-error`.

##### Further functionalities
- `webMonetizationChecker.js` extends the web monetization with the following events listeners:
	- `monetizationstart-error` uses the same technique in [https://testwebmonetization.com/](https://testwebmonetization.com/) for detecting when monetization doesn't start after a specific period of time. This is defined by `startErrorWaitingTime (default = 8000) ` .
	- `monetizationprogress-error`  dispatched when `monetizationprogress` is not occurring after a specifying period of time. This is defined by`progressErrorWatitingTime (default = 6000) `.
	-  `receiptVerification` response:
		- Upon success dispatches `monetizationreceipt`.
		- Upon fail dispatches `monetizationreceipt-error` .
	- `vanillaVerification` response returns :
		- Upon success dispatches `monetizationproof`. 
		- Upon fail dispatches `monetizationproof-error` .

###### Example usage 
```
document.monetization.addEventListener("monetizationstart-error", function(){
	console.log("Monetization start event not occurred");
});
```
- `webMonetizationFaker.js` this is the module that mocks web monetization api.

- `webMonetizationHelper.js` helper functions to start/stop monetization, retrieve the current payment pointer in the metatag and observe its mutations.

#### VideoAdvertizer

It  initializes and plays the video ads and also exposes `stopAds` method for stopping them when needed.
```
import { initVideoAdvertizer } from "web-monetization-video-ads";

const adsConfig = {
	tagUrl,
	live:false,
	interval:30
},  

const videoAdvertizer = initVideoAdvertizer(adsConfig);
```
##### Config
-  `tagUrl` your custom VAST tag-url.
-  `live (default=false)` optional settings to repeat an advert after a certain amount of time defined by `interval (default=30 sec)` .
## Issues
- MultiVideos are not yet supported or tested. 
- Ad-blockers are not yet supported or tested.
## Not Supported
- Not supported for Safari < 10 or IE11 
- On iPhone the video must have a `playinsline` and `muted` attributes
## License
This project uses the following license: [MIT License](https://github.com/Vivid-IOV-Labs/web-monetisation-video-ads/blob/main/LICENSE.md).
