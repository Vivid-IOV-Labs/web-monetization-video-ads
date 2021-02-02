/* eslint-disable no-debugger */
/* eslint-disable no-undef */
const imaSdkUrl = "//imasdk.googleapis.com/js/sdkloader/ima3.js";

export const videoAdvertizer = new EventTarget();

function initialContext() {
  return {
    adDisplayContainerisInitialized: false,
    hasPlayed: false,
    isPlaying: false,
    isInitialized: false,
    status: "notinitialized",
    skipNext: false,
    interval: 20,
    lang: "eng",
    live: false,
    tagUrl: null,
    remainingTime: 0,
    intervalTimer: null,
    liveAdsTimeout: null,
    videoWrapper: null,
    adContainer: null,
    adDisplayContainer: null,
    videoElement: null,
    adsManager: null,
    adsLoader: null,
    stopped: false,
    destroyed: false,
    started: false,
  };
}

export let context = initialContext();

function initAds({
  videoElement,
  tagUrl,
  live = false,
  interval = 30,
  lang = "eng",
}) {
  context = { ...context, ...{ videoElement, tagUrl, live, interval } };
  return new Promise((resolve, reject) => {
    createVideoElementWrapper(videoElement);
    loadScript(imaSdkUrl)
      .then(() => {
        google.ima.settings.setVpaidMode(
          google.ima.ImaSdkSettings.VpaidMode.ENABLED
        );
        google.ima.settings.setLocale(lang);

        const isPlaysInline = !![...videoElement.attributes].find(
          ({ name }) => name === "playsinline"
        );
        google.ima.settings.setDisableCustomPlaybackForIOS10Plus(isPlaysInline);

        context.adContainer = createAdContainerRef(videoElement);
        context.adDisplayContainer = createDisplayer({
          adContainer: context.adContainer,
          videoElement,
        });
        context.adsLoader = createLoader({
          videoElement,
          adDisplayContainer: context.adDisplayContainer,
        });
        requestAds({ tagUrl, videoElement });
        resolve(true);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function startAds({ videoElement, tagUrl, live, interval }) {
  const { isInitialized, adsManager } = context;
  if (isInitialized) {
    if (live) {
      adsManager.start();
    } else {
      adsManager.setVolume(videoElement.volume);
      context.skipNext = false;
    }
  } else {
    initAdsAndAttachStartHandler({ videoElement, tagUrl, live, interval });
  }
}

function initAdsAndAttachStartHandler({
  videoElement,
  tagUrl,
  live,
  interval,
}) {
  initAds({ videoElement, tagUrl, live, interval })
    .then(() => {
      videoAdvertizer.addEventListener("adsmanager-loaded", () => {
        if (videoElement.paused) {
          videoElement.addEventListener(
            "play",
            (event) => {
              playAds(event);
            },
            { once: true }
          );
        } else {
          playAds();
        }
      });
    })
    .catch((err) => {
      errorHandler(err);
    });
}

export function stopAds() {
  const { live, liveAdsTimeout, videoElement } = context;
  if (live) {
    clearTimeout(liveAdsTimeout);
    destroyAds();
  } else {
    const time = videoElement.currentTime;

    const nextPoints = context.cuePoints.filter((cuePoint) => {
      return time <= cuePoint;
    });

    const { 0: nextPoint } = nextPoints;
    const rangeTime = Math.abs(time - nextPoint);
    if (time <= nextPoint && rangeTime < 5) {
      context.skipNext = true;
    }
  }
}

function playAds() {
  const { adDisplayContainer, videoElement, adsManager } = context;

  try {
    if (!context.adDisplayContainerisInitialized) {
      if (videoElement.currentTime == 0) {
        videoElement.load();
      }
      adDisplayContainer.initialize();
      context.adDisplayContainerisInitialized = true;
    }
    const width = videoElement.clientWidth;
    const height = videoElement.clientHeight;
    adsManager.init(width, height, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (e) {
    errorHandler(e);
  }
}

function destroyAds() {
  const { adDisplayContainer, adContainer, adsManager, videoElement } = context;
  adDisplayContainer.destroy();
  adsManager.destroy();
  adContainer.remove();
  context = initialContext();
  videoElement.play();
}

const requestAds = ({
  tagUrl,
  videoElement,
  liveStreamPrefetchSeconds = 0,
}) => {
  try {
    if (context.live) {
      if (context.adsManager) {
        context.adsManager.destroy();
      }
      if (context.adsLoader) {
        context.adsLoader.contentComplete();
      }
    }
    const adsRequest = createRequest({
      tagUrl,
      videoElement,
      liveStreamPrefetchSeconds,
    });
    context.adsLoader.getSettings().setAutoPlayAdBreaks(false);
    context.adsLoader.requestAds(adsRequest);
  } catch (e) {
    errorHandler(e);
  }
};

const dispatchEvent = (name, payload = null) => {
  const event = new CustomEvent(name, { detail: payload });
  videoAdvertizer.dispatchEvent(event);
};

const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = resolve;
    script.onerror = reject;
    script.src = src;
    document.head.append(script);
  });
};

function wrap(el, wrapper) {
  el.parentNode.insertBefore(wrapper, el);
  return wrapper.appendChild(el);
}

const createVideoElementWrapper = (videoElement) => {
  const css = `
  height: auto;
  margin: auto;
  width: 100%;
  display: block;
  vertical-align: top;
  box-sizing: border-box;
  background-color: #000;
  position: relative;
  padding: 0;
  line-height: 1;
  `;
  if (videoElement.parentNode.children > 1) {
    const videoWrapper = document.createElement("div");
    videoWrapper.style.cssText = css;

    wrap(videoElement, videoWrapper);
  } else {
    const parentNode = videoElement.parentNode;
    parentNode.style.cssText = css;
  }
  context.videoWrapper = videoElement.parentNode;
};

const createAdContainerRef = (videoElement) => {
  const css = `
  position: absolute;
  display: none;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 9999;`;
  const adContainerElement = document.createElement("div");
  adContainerElement.style.cssText = css;
  videoElement.parentNode.insertBefore(adContainerElement, videoElement);
  return adContainerElement;
};

const createDisplayer = ({ adContainer, videoElement }) => {
  return new google.ima.AdDisplayContainer(adContainer, videoElement);
};

const createLoader = ({ videoElement, adDisplayContainer }) => {
  try {
    const adsLoader = new google.ima.AdsLoader(adDisplayContainer);
    videoElement.addEventListener("ended", () => {
      adsLoader.contentComplete();
    });
    adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false
    );
    adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false
    );
    return adsLoader;
  } catch (e) {
    errorHandler(e);
  }
};

const createRequest = ({ tagUrl, videoElement, liveStreamPrefetchSeconds }) => {
  try {
    const adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = tagUrl;
    adsRequest.linearAdSlotWidth = videoElement.clientWidth;
    adsRequest.linearAdSlotHeight = videoElement.clientHeight;
    adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
    adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;
    adsRequest.liveStreamPrefetchSeconds = liveStreamPrefetchSeconds;
    adsRequest.setAdWillPlayMuted(!videoElement.muted);
    return adsRequest;
  } catch (e) {
    errorHandler(e);
  }
};

const onAdsManagerLoaded = (adsManagerLoadedEvent) => {
  try {
    var adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    context.adsManager = adsManagerLoadedEvent.getAdsManager(
      context.videoElement,
      adsRenderingSettings
    );
    context.cuePoints = context.adsManager.getCuePoints();
    context.adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError
    );
    context.adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested
    );
    context.adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested
    );
    context.adsManager.addEventListener(
      google.ima.AdEvent.Type.LOADED,
      onAdLoaded
    );
    window.addEventListener("resize", function () {
      resizeAdsManager(context.videoElement);
    });
    context.adsManager.addEventListener(
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      onAdEvent
    );
    context.adsManager.addEventListener(
      google.ima.AdEvent.Type.STARTED,
      onAdEvent
    );
    context.adsManager.addEventListener(
      google.ima.AdEvent.Type.COMPLETE,
      onAdEvent
    );
    context.adsManager.addEventListener(
      google.ima.AdEvent.Type.AD_BREAK_READY,
      adBreakReadyHandler
    );
    dispatchEvent("adsmanager-loaded", context.adsManager);
    Object.keys(google.ima.AdEvent.Type).forEach((type) => {
      context.adsManager.addEventListener(
        google.ima.AdEvent.Type[type],
        (event) => {
          const type = event.type.replace(/_/g, "").toLowerCase();
          context.status = type;
          dispatchEvent("ad-" + type, event);
        }
      );
    });
    context.isInitialized = true;
  } catch (e) {
    errorHandler(e);
  }
};

function errorHandler(err) {
  console.error(err);
  throw new Error(err);
}

function adBreakReadyHandler() {
  if (!context.live && !context.skipNext) {
    context.adsManager.start();
  } else {
    return;
  }
}

const resizeAdsManager = (videoElement) => {
  if (context.adsManager) {
    const width = videoElement.clientWidth;
    const height = videoElement.clientHeight;
    context.adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
  }
};

const onContentPauseRequested = () => {
  context.isPlaying = true;
  context.adContainer.style.display = "block";
  context.videoElement.pause();
};

const onContentResumeRequested = () => {
  context.isPlaying = false;
  context.adContainer.style.display = "none";
  context.videoElement.play();
};

const onAdLoaded = (adEvent) => {
  const ad = adEvent.getAd();
  resizeAdsManager(context.videoElement);
  if (!ad.isLinear()) {
    context.videoElement.play();
  }
};

const onAdError = (adErrorEvent) => {
  errorHandler(adErrorEvent.getError());
  if (context.dsManager) {
    context.adsManager.destroy();
  }
};

const onAdEvent = (adEvent) => {
  var ad = adEvent.getAd();

  switch (adEvent.type) {
    case google.ima.AdEvent.Type.LOADED:
      break;
    case google.ima.AdEvent.Type.STARTED:
      context.hasPlayed = true;
      if (ad.isLinear()) {
        context.intervalTimer = setInterval(function () {
          context.remainingTime = context.adsManager
            ? context.adsManager.getRemainingTime()
            : 0;
        }, 1000);
      }
      break;
    case google.ima.AdEvent.Type.COMPLETE:
      if (ad.isLinear()) {
        clearInterval(context.intervalTimer);
      }
      break;
    case google.ima.AdEvent.Type.ALL_ADS_COMPLETED:
      if (context.live) {
        requestAds({
          videoElement: context.videoElement,
          tagUrl: context.tagUrl,
          liveStreamPrefetchSeconds: context.interval - 5,
        });
        context.liveAdsTimeout = setTimeout(() => {
          if (!context.videoElement.paused) {
            playAds();
          }
        }, context.interval * 1000);
      }
      break;
  }
};
