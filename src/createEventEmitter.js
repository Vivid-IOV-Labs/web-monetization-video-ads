export let createEventEmitter = () => {
  let callbackList = [];
  return {
    on(callback) {
      callbackList.push(callback);
    },
    emit() {
      callbackList.forEach((callback) => {
        callback();
      });
    },
  };
};
