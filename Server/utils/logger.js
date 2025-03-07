// logger.js
const LOG_LEVEL = process.env.LOG_LEVEL || "info";

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const log = (level, message) => {
  if (logLevels[level] <= logLevels[LOG_LEVEL]) {
    console.log(message);
  }
};

export default log;
