const fs = require("fs");
const path = require("path");
const winston = require("winston");

// Ensure the logs directory exists
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define a custom log format with colors
const logFormat = winston.format.combine(
  winston.format.colorize(), // Add colors to log levels
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add a timestamp
  winston.format.printf(function (info) {
    // Customize how Log messages are displayed
    return `${info.timestamp} [${info.level}]: ${info.message}`;
  })
);

// Create a Logger instance
const logger = winston.createLogger({
  level: "info", // Log level (info, error, etc.)
  format: logFormat, // Using the custom format defined above
  transports: [
    // Writing all logs (info and above) to a general log file
    new winston.transports.File({
      filename: path.join(logDir, "application.log"),
      format: winston.format.combine(
        winston.format.uncolorize(), // Remove colors for file logs
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(function (info) {
          return `${
            info.timestamp
          } [${info.level.toUpperCase()}]: ${info.message}`;
        })
      ),
    }),

    // Write only error logs to a separate file
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: winston.format.combine(
        winston.format.uncolorize(), // Remove colors for file logs
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(function (info) {
          return `${
            info.timestamp
          } [${info.level.toUpperCase()}]: ${info.message}`;
        })
      ),
    }),

    // Display logs on the console with colors
    new winston.transports.Console(),
  ],
});

module.exports = logger;
