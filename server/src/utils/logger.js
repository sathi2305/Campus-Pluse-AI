const logger = {
  info: (...args) => console.log('[CampusPulse INFO]', ...args),
  warn: (...args) => console.warn('[CampusPulse WARN]', ...args),
  error: (...args) => console.error('[CampusPulse ERROR]', ...args),
};

export default logger;
