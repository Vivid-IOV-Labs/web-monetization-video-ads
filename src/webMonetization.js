export const isWebMonetized = () => !!document.monetization;

export const getPointerFromMetaTag = () => {
  const monetizationTag = document.querySelector('meta[name="monetization"]');
  return (monetizationTag && monetizationTag.getAttribute("content")) || null;
};

export const startMonetization = (paymentPointer) => {
  const monetizationTag = document.querySelector('meta[name="monetization"]');
  if (!monetizationTag) {
    const monetizationTag = document.createElement("meta");
    monetizationTag.name = "monetization";
    monetizationTag.content = paymentPointer;
    document.head.appendChild(monetizationTag);
  }
};

export const stopMonetization = () => {
  const monetizationTag = document.querySelector('meta[name="monetization"]');
  if (monetizationTag) monetizationTag.remove();
};

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

const detectMetaTag = ({ onRemoved, onAdded }) =>
  new MutationObserver((mutations) => {
    if (detectMetaTagAdded(mutations)) {
      onAdded();
    }
    if (detectMetaTagRemoved(mutations)) {
      onRemoved();
    }
  });

export const observeMetaTagMutations = ({
  onRemoved,
  onAdded,
  document = window.document,
}) => {
  detectMetaTag({ onRemoved, onAdded }).observe(document.head, {
    childList: true,
  });
};
