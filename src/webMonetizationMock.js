const createEvents = ({
  paymentPointer,
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

export const initFakeMonetization = (
  paymentPointer,
  triggerFail = { enabled: false, onStart: false, onProgress: true, timeout: 0 }
) => {
  document.monetization = new EventTarget();
  document.monetization.state = "stopped";
  const requestId = "3rqefsvd";
  const amount = "5421";
  const assetCode = "USD";
  const assetScale = 6;
  const finalized = false;
  const receipt = null;
  const events = createEvents({
    paymentPointer,
    requestId,
    amount,
    assetCode,
    assetScale,
    receipt,
    finalized,
  });
  const fakeMonetizationEmitter = new FakeMonetizationEmitter(
    events,
    triggerFail
  );
  observeMetaTagMutations(fakeMonetizationEmitter);
};
class FakeMonetizationEmitter {
  constructor(events, triggerFail) {
    this.monetizationProgressInterval = null;
    this.events = events;
    this.events = triggerFail;
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
    }, 3000);
    if (this.triggerFail.enabled && this.onProgress) {
      setTimeout(() => {
        clearTimeout(this.monetizationProgressInterval);
      }, this.triggerFail.timeout);
    }
  }
}

const detectMetaTagRemoved = (mutations) => {
  return (
    mutations[0] &&
    mutations[0].removedNodes &&
    mutations[0].removedNodes[0] &&
    mutations[0].removedNodes[0].name == "monetization" &&
    mutations[0].removedNodes[0].content
  );
};

const detectMetaTagAdded = (mutations) => {
  return (
    mutations[0] &&
    mutations[0].addedNodes &&
    mutations[0].addedNodes[0] &&
    mutations[0].addedNodes[0].name == "monetization" &&
    mutations[0].addedNodes[0].content
  );
};

const detectMetaTag = (fakeMonetizationEmitter) =>
  new MutationObserver((mutations) => {
    if (detectMetaTagAdded(mutations)) {
      fakeMonetizationEmitter.dispatchPending();
      if (!fakeMonetizationEmitter.triggerFail.enabled.onStart) {
        fakeMonetizationEmitter.dispatchStart();
        fakeMonetizationEmitter.dispatchProgress();
      } else {
        fakeMonetizationEmitter.dispatchStop();
      }
    }
    if (detectMetaTagRemoved(mutations)) {
      fakeMonetizationEmitter.dispatchStop();
    }
  });

const observeMetaTagMutations = (fakeMonetizationEmitter) => {
  detectMetaTag(fakeMonetizationEmitter).observe(document.head, {
    childList: true,
  });
};
