// src/utils/logger.js
const chalk = require('chalk');

const logger = {
  info: (message) => {
    console.log(chalk.blue(`[INFO] ${message}`));
  },
  
  success: (message) => {
    console.log(chalk.green(`[SUCCESS] ${message}`));
  },
  
  error: (message) => {
    console.error(chalk.red(`[ERROR] ${message}`));
  },
  
  warn: (message) => {
    console.log(chalk.yellow(`[WARNING] ${message}`));
  },
  
  progress: (current, total, message = '') => {
    const percentage = Math.round((current / total) * 100);
    console.log(chalk.cyan(`[PROGRESS] ${current}/${total} (${percentage}%) ${message}`));
  }
};

module.exports = { logger };