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

export const initFakeMonetization = (paymentPointer) => {
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
  const fakeMonetizationEmitter = new FakeMonetizationEmitter(events);
  observeMetaTagMutations(fakeMonetizationEmitter);
};
class FakeMonetizationEmitter {
  constructor(events) {
    this.monetizationProgressInterval = null;
    this.events = events;
  }
  dispatchStop() {
    clearInterval(this.monetizationProgressInterval);
    const event = new CustomEvent(
      "monetizationstop",
      this.events.monetizationstop
    );
    document.monetization.dispatchEvent(event);
    document.monetization.state = "stopped";
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
      fakeMonetizationEmitter.dispatchStart();
      fakeMonetizationEmitter.dispatchProgress();
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
