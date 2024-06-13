const moment = require("moment-timezone");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf, colorize, splat, json } = format;

const path = require("path");

const timezoned = () => {
    return moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss.SSS");
};

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] [${level}]: ${message}`;
});

const logger = createLogger({
    format: combine(
        label({ label: path.basename(process.mainModule.filename) }),
        splat(),
        timestamp({ format: timezoned }),
        json(),
    ),
    transports: [new transports.Console()],
});

module.exports = logger;
