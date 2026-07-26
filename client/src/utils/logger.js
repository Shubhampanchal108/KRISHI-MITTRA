const logger = {
  log: (...args) => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.log(...args);
    }
  },
  info: (...args) => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.info(...args);
    }
  },
  warn: (...args) => {
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // Errors are logged or can be forwarded to crash reporting service
    if (typeof __DEV__ !== "undefined" && __DEV__) {
      console.error(...args);
    }
  },
};

export default logger;
