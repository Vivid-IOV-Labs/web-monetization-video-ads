export const delay = (time) => {
  let timer;
  clearTimeout(timer);
  return new Promise((resolve) => {
    timer = setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export const clearDocument = () => {
  document.monetization = undefined;
  document.getElementsByTagName("html")[0].innerHTML = "";
};

export const checkEvents = () => {
  const events = {};
  function handler({ type }) {
    if (events[type]) {
      events[type] += 1;
    } else {
      events[type] = 1;
    }
    return events;
  }
  document.monetization.addEventListener("monetizationpending", handler);
  document.monetization.addEventListener("monetizationstart", handler);
  document.monetization.addEventListener("monetizationprogress", handler);
  document.monetization.addEventListener("monetizationstop", handler);
  return events;
};
