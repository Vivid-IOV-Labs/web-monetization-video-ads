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
