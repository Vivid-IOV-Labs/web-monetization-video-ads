/* eslint-disable no-undef */
const imaSdkUrl = "//imasdk.googleapis.com/js/sdkloader/ima3.js";

const emitter = new EventTarget();

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

const videoAdvertizer = {
  emitter,
  context,
};

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
    videoElement.allowFullscreen = false;
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
  return videoAdvertizer;
}

function initAdsAndAttachStartHandler({
  videoElement,
  tagUrl,
  live,
  interval,
}) {
  initAds({ videoElement, tagUrl, live, interval })
    .then(() => {
      emitter.addEventListener("adsmanager-loaded", () => {
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

  if (!context.adDisplayContainerisInitialized) {
    if (videoElement.currentTime == 0) {
      videoElement.load();
    }
    adDisplayContainer.initialize();
    context.adDisplayContainerisInitialized = true;
  }
  resizeAdsManager("init");

  adsManager.start();
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
};

const dispatchEvent = (name, payload = null) => {
  const event = new CustomEvent(name, { detail: payload });
  emitter.dispatchEvent(event);
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
  // const height = videoElement.clientHeight;
  // const css = `
  // height: ${height}px;
  // margin: auto;
  // width: 100%;
  // display: block;
  // vertical-align: top;
  // box-sizing: border-box;
  // background-color: #000;
  // position: relative;
  // padding: 0;
  // line-height: 1;
  // overflow:hidden
  // `;
  const css = `
  width: 100%;
  display: block;
  background-color: #000;
  position: relative;
  padding: 0;
  `;

  const videoWrapper = document.createElement("div");
  videoWrapper.style.cssText = css;
  videoWrapper.classList.add("ads-video-wrapper");
  wrap(videoElement, videoWrapper);
  context.videoWrapper = videoElement.parentNode;
};

const createAdContainerRef = (videoElement) => {
  const css = `
  position: absolute;
  display: none;
  top: 0;
  left: 0;
  width: 100%;
  height:100%;
  z-index: 2147483647;`;
  const adContainerElement = document.createElement("div");
  adContainerElement.style.cssText = css;
  videoElement.parentNode.insertBefore(adContainerElement, videoElement);
  return adContainerElement;
};

const createDisplayer = ({ adContainer, videoElement }) => {
  return new google.ima.AdDisplayContainer(adContainer, videoElement);
};

const createLoader = ({ videoElement, adDisplayContainer }) => {
  const adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  adsLoader.getSettings().setAutoPlayAdBreaks(false);
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
};

const createRequest = ({ tagUrl, videoElement }) => {
  const adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = tagUrl;
  adsRequest.linearAdSlotWidth = videoElement.clientWidth;
  adsRequest.linearAdSlotHeight = videoElement.clientHeight;
  adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
  adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;
  //adsRequest.liveStreamPrefetchSeconds = liveStreamPrefetchSeconds;
  adsRequest.setAdWillPlayMuted(!videoElement.muted);
  return adsRequest;
};

const onAdsManagerLoaded = (adsManagerLoadedEvent) => {
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
    resizeAdsManager();
  });
  document.addEventListener("fullscreenchange", function () {
    resizeAdsManager();
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
};

function errorHandler(err) {
  throw new Error(err);
}

function adBreakReadyHandler() {
  if (!context.skipNext) {
    context.adsManager.start();
  }
}

function resizeAdsManager(action = "resize") {
  const isFullScreen = document.fullscreenElement;
  if (isFullScreen) {
    fullscreenAds(action);
  } else {
    resizeAds(action);
  }
}
const resizeAds = (action) => {
  const { adsManager, adContainer, videoElement, videoWrapper } = context;
  if (adsManager) {
    const width = videoElement.clientWidth;
    const height = videoElement.clientHeight;
    adContainer.style.position = `absolute`;
    adContainer.style.width = `${width}px`;
    adContainer.style.height = `${height}px`;
    videoWrapper.style.width = `${width}px`;
    videoWrapper.style.height = `${height}px`;
    adsManager[action](width, height, google.ima.ViewMode.NORMAL);
  }
};

const fullscreenAds = (action) => {
  const { adsManager, adContainer } = context;
  if (adsManager) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    adContainer.style.position = `fixed`;
    adsManager[action](width, height, google.ima.ViewMode.FULLSCREEN);
  }
};

const onContentPauseRequested = () => {
  context.isPlaying = true;
  context.videoElement.style.display = "none";
  context.adContainer.style.display = "block";
  context.videoElement.pause();
};

const onContentResumeRequested = () => {
  context.isPlaying = false;
  context.videoElement.style.display = "block";
  context.adContainer.style.display = "none";
  context.videoElement.play();
};

const onAdLoaded = (adEvent) => {
  const ad = adEvent.getAd();
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
        context.liveAdsTimeout = new Timer(function () {
          requestAds({
            videoElement: context.videoElement,
            tagUrl: context.tagUrl,
          });
        }, context.interval * 1000);

        context.videoElement.addEventListener("pause", () => {
          context.liveAdsTimeout.pause();
        });
        context.videoElement.addEventListener("play", () => {
          context.liveAdsTimeout.resume();
        });
      }
      break;
  }
};

function Timer(callback, delay) {
  var timerId,
    start,
    remaining = delay;

  this.pause = function () {
    window.clearTimeout(timerId);
    remaining -= new Date() - start;
  };

  this.resume = function () {
    start = new Date();
    window.clearTimeout(timerId);
    timerId = window.setTimeout(callback, remaining);
  };

  this.resume();
}
