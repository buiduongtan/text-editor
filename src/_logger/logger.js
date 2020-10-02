const { createLogger, format, transports } = require('winston');

const { combine, timestamp, printf } = format;
require('winston-daily-rotate-file');
const path = require('path');

const trans = [];

const myFormat = printf(({ level, message, timestamp }) => `${timestamp} [${level}] ${message}`);

trans.push(
    new transports.DailyRotateFile({
        name: 'file',
        datePattern: 'YYYY-MM-DDTHH',
        maxFiles: 2,
        filename: path.join(__dirname, '../logs', 'log_file.log')
    })
);


const logger = createLogger({
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: trans
});

module.exports = logger;
