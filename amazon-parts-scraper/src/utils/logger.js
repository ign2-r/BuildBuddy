const logger = {
    info: (message) => console.log(`[INFO] ${message}`),
    error: (message) => console.error(`[ERROR] ${message}`),
    success: (message) => console.log(`[SUCCESS] ${message}`)
  };
  
  module.exports = { logger };