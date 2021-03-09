jest.mock("../src/videoAdvertizer");
import { initVideoAdsMonetizer } from "../src/videoAdsMonetizer";
import { initVideoAdvertizer } from "../src/videoAdvertizer";
import * as videoMonetizer from "../src/videoMonetizer";
import { clearDocument, delay } from "../tests/utils";
import { htmlMediaMock } from "./htmlMediaMock";

const paymentPointer = "$custompaymentpointer";

describe("Video Monetizer", () => {
  afterEach(() => {
    jest.resetAllMocks();
    clearDocument();
  });

  it("Should start monetize when enabled", async () => {
    document.body.innerHTML = `
        <video id="video-element"></video>
      `;
    const videoElement = document.getElementById("video-element");
    const monetizationConfig = {
      paymentPointer,
      fakeMonetization: {
        enabled: true,
      },
    };
    const adsConfig = {
      tagUrl: "xxx",
    };

    const spyMonetizer = jest.spyOn(videoMonetizer, "initVideoMonetizer");
    const startAdsHandler = jest.fn();
    initVideoAdvertizer.mockResolvedValue({
      startAds: startAdsHandler,
      stopAds: jest.fn(),
      context: {},
    });
    await initVideoAdsMonetizer({
      videoElement,
      startAdsTime: 4000,
      adsConfig,
      monetizationConfig,
    });
    expect(spyMonetizer).toHaveBeenCalledWith({
      ...monetizationConfig,
      videoElement,
    });
    expect(startAdsHandler).not.toHaveBeenCalled();
  });

  it("Should start advertize when monetization disabled", async () => {
    document.body.innerHTML = `
        <video id="video-element"></video>
      `;
    const videoElement = document.getElementById("video-element");
    const monetizationConfig = {
      paymentPointer,
    };
    const adsConfig = {
      tagUrl: "xxx",
    };
    const spyMonetizer = jest.spyOn(videoMonetizer, "initVideoMonetizer");
    const startAdsHandler = jest.fn();
    initVideoAdvertizer.mockResolvedValue({
      startAds: startAdsHandler,
      stopAds: jest.fn(),
      context: {},
    });
    await initVideoAdsMonetizer({
      videoElement,
      adsConfig,
      monetizationConfig,
    });
    expect(spyMonetizer).toHaveBeenCalled();
    expect(startAdsHandler).toHaveBeenCalled();
  });

  it("Should start advertize on monetization fail start", async () => {
    htmlMediaMock();
    document.body.innerHTML = `
        <video id="video-element"></video>
      `;
    const videoElement = document.getElementById("video-element");
    const monetizationConfig = {
      paymentPointer,
      fakeMonetization: {
        enabled: true,
        triggerFail: {
          onStart: true,
        },
      },
    };
    const adsConfig = {
      tagUrl: "xxx",
    };
    const spyMonetizer = jest.spyOn(videoMonetizer, "initVideoMonetizer");
    const startAdsHandler = jest.fn();
    initVideoAdvertizer.mockResolvedValue({
      startAds: startAdsHandler,
      stopAds: jest.fn(),
      context: {},
    });
    await initVideoAdsMonetizer({
      videoElement,
      startAdsTime: 0,
      adsConfig,
      monetizationConfig,
    });
    videoElement.play();
    await delay(500);
    expect(spyMonetizer).toHaveBeenCalled();
    expect(startAdsHandler).toHaveBeenCalledTimes(1);
  });

  it("Should start advertize on monetization fail second start", async () => {
    htmlMediaMock();
    document.body.innerHTML = `
        <video id="video-element"></video>
      `;
    const videoElement = document.getElementById("video-element");
    const monetizationConfig = {
      paymentPointer,
      fakeMonetization: {
        enabled: true,
      },
    };
    const adsConfig = {
      tagUrl: "xxx",
    };
    const spyMonetizer = jest.spyOn(videoMonetizer, "initVideoMonetizer");
    const startAdsHandler = jest.fn();
    initVideoAdvertizer.mockResolvedValue({
      startAds: startAdsHandler,
      stopAds: jest.fn(),
      context: {},
    });
    await initVideoAdsMonetizer({
      videoElement,
      startAdsTime: 0,
      adsConfig,
      monetizationConfig,
    });
    videoElement.play();
    await delay(500);
    videoElement.pause();
    // fake monetization issue like removing coil extension
    document.monetization = undefined;

    videoElement.play();
    await delay(500);
    expect(spyMonetizer).toHaveBeenCalled();
    expect(startAdsHandler).toHaveBeenCalledTimes(1);
  });

  it("Should start advertize on monetization fail progress", async () => {
    htmlMediaMock();
    document.body.innerHTML = `
        <video id="video-element"></video>
      `;
    const videoElement = document.getElementById("video-element");
    const monetizationConfig = {
      paymentPointer,
      fakeMonetization: {
        enabled: true,
        triggerFail: {
          onProgress: true,
          timeout: 1000,
        },
      },
    };
    const adsConfig = {
      tagUrl: "xxx",
    };
    const spyMonetizer = jest.spyOn(videoMonetizer, "initVideoMonetizer");
    const startAdsHandler = jest.fn();
    initVideoAdvertizer.mockResolvedValue({
      startAds: startAdsHandler,
      stopAds: jest.fn(),
      context: {},
    });
    await initVideoAdsMonetizer({
      videoElement,
      startAdsTime: 0,
      adsConfig,
      monetizationConfig,
    });
    videoElement.play();
    await delay(1500);
    expect(spyMonetizer).toHaveBeenCalled();
    expect(startAdsHandler).toHaveBeenCalledTimes(1);
  });
});
