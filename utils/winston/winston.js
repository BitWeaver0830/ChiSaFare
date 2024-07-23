const winston = require('winston');
require('winston-daily-rotate-file');
const dayjs = require('dayjs');
const util = require('util');

/* printf_col -> with colors for console output */
var _printf_col = winston.format.printf((info)=>{
    const timestamp = info.timestamp.trim();
    const level = info.level;
    const message = (info.message || "").trim();
    const args = info[Symbol.for("splat")];
    const strArgs = (args || [])
        .map(arg => util.inspect(arg,{colors:true}))
        .join(" ");
    return `${timestamp} [${level}] - ${message} ${strArgs}`;
})

var _printf = winston.format.printf((info)=>{
    const timestamp = info.timestamp.trim();
    const level = info.level;
    const message = (info.message || "").trim();
    const args = info[Symbol.for("splat")];
    const strArgs = (args || []);
    return `${timestamp} [${level}] - ${message} ${strArgs}`;
})

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({format: dayjs().format()}),
        _printf
    ),
    level: "debug",
    transports: [
        new winston.transports.DailyRotateFile({
            filename: "./logs/log-%DATE%",
            maxSize: "50mb",
            maxFiles: "7d",
            level: "debug",
            zippedArchive: false,
            extension: '.log',
            auditFile: './logs/audits/log.json'
        })
    ]
})

if(process.env.NODE_ENV != "production"){
    logger.add(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({format: dayjs().format()}),
                _printf_col
            )
        })
    )
}

module.exports = logger