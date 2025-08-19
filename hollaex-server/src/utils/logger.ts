import winston from 'winston';
import { config } from '../config';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'hollaex-server' },
  transports: [
    new winston.transports.Console({
      format: consoleFormat
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ],
});

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (config.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
