const fs = require("fs");
const path = require("path");
const winston = require("winston");

//Ensure the logs directory exists
const logDir = path.join(__dirname, "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

//Define a custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), //Add a timestamp
  winston.format.printf(function (info) {
    //Customize how Log messages are displayed
    return (
      info.timestamp + " [" + info.level.toUpperCase() + "]: " + info.message
    );
  })
);

//Create a Logger instance
const logger = winston.createLogger({
  level: "info", //Log level (info, error, etc.)
  format: logFormat, //Using the customer format defined above
  transports: [
    //Writing all logs (info and above) to a general log file
    new winston.transports.File({
      filename: path.join(logDir, "application.log"),
    }),

    //Write only error logs to a seperate file
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),

    //Display logs on the console
    new winston.transports.Console(),
  ],
});

module.exports = logger;
