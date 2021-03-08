import {
  observeMetaTagMutations,
  getPointerFromMetaTag,
} from "./webMonetizationHelper";
import EventTarget from "@ungap/event-target";

const createEvents = ({
  paymentPointer = "",
  requestId,
  amount,
  assetCode,
  assetScale,
  receipt,
  finalized,
}) => {
  return {
    monetizationstart: {
      detail: {
        paymentPointer,
        requestId,
      },
    },
    monetizationpending: {
      detail: {
        paymentPointer,
        requestId,
      },
    },
    monetizationprogress: {
      detail: {
        paymentPointer,
        requestId,
        amount,
        assetCode,
        assetScale,
        receipt,
      },
    },
    monetizationstop: {
      detail: {
        paymentPointer,
        requestId,
        finalized,
      },
    },
  };
};

export const initFakeMonetization = ({
  triggerFail = {
    onStart: false,
    onProgress: false,
    timeout: 5000,
  },
  progressTime = 500,
} = {}) => {
  if (triggerFail.onStart && triggerFail.onProgress) {
    throw new Error("onStart and onProgress cannot be both true");
  }
  document.monetization = new EventTarget();
  document.monetization.state = "stopped";
  const requestId = "3rqefsvd";
  const amount = "5421";
  const assetCode = "USD";
  const assetScale = 6;
  const finalized = false;
  const receipt = null;
  const events = createEvents({
    requestId,
    amount,
    assetCode,
    assetScale,
    receipt,
    finalized,
  });

  const fakeMonetizationEmitter = new FakeMonetizationEmitter(
    events,
    triggerFail,
    progressTime
  );

  const onAdded = () => {
    const events = createEvents({
      paymentPointer: getPointerFromMetaTag(),
      requestId,
      amount,
      assetCode,
      assetScale,
      receipt,
      finalized,
    });
    fakeMonetizationEmitter.events = events;
    fakeMonetizationEmitter.dispatchPending();
    if (!fakeMonetizationEmitter.triggerFail.onStart) {
      fakeMonetizationEmitter.dispatchStart();
      fakeMonetizationEmitter.dispatchProgress();
    }
  };

  const onRemoved = () => {
    fakeMonetizationEmitter.dispatchStop();
  };

  observeMetaTagMutations({ onAdded, onRemoved });
};
class FakeMonetizationEmitter {
  constructor(events, triggerFail, progressTime) {
    this.monetizationProgressInterval = null;
    this.events = events;
    this.triggerFail = triggerFail;
    this.progressTime = progressTime;
  }
  dispatchStop() {
    if (this.monetizationProgressInterval) {
      clearInterval(this.monetizationProgressInterval);
    }
    const event = new CustomEvent(
      "monetizationstop",
      this.events.monetizationstop
    );
    document.monetization.dispatchEvent(event);
    document.monetization.state = "stopped";
  }
  dispatchPending() {
    const event = new CustomEvent(
      "monetizationpending",
      this.events.monetizationstart
    );
    document.monetization.dispatchEvent(event);
    document.monetization.state = "pending";
  }
  dispatchStart() {
    const event = new CustomEvent(
      "monetizationstart",
      this.events.monetizationstart
    );
    document.monetization.dispatchEvent(event);
    document.monetization.state = "started";
  }
  dispatchProgress() {
    const event = new CustomEvent(
      "monetizationprogress",
      this.events.monetizationprogress
    );
    this.monetizationProgressInterval = setInterval(() => {
      document.monetization.dispatchEvent(event);
      document.monetization.state = "progress";
    }, this.progressTime);
    if (this.triggerFail.onProgress) {
      setTimeout(() => {
        clearInterval(this.monetizationProgressInterval);
      }, this.triggerFail.timeout);
    }
  }
}
