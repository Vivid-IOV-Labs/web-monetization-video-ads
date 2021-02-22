export function isInactiveActiveTab(handleVisibilityChange) {
  let hidden, visibilityChange;
  if (typeof document.hidden !== "undefined") {
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }
  function handler() {
    handleVisibilityChange(document[hidden]);
  }
  if (
    typeof document.addEventListener === "undefined" ||
    hidden === undefined
  ) {
    throw new Error("Page Visibility API not enabled");
  } else {
    document.addEventListener(visibilityChange, handler, false);
  }
}
