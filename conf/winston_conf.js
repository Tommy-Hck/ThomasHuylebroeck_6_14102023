const winston = require('winston');

let mylogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    //defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `info.log`
        //
        new winston.transports.File({
            filename: `${__dirname}/../log/error.log`,
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'DD-MM-YYYY hh:mm:ss A ZZ'
                }),
                winston.format.json()
            ),
            handleExceptions: true
        }),
        new winston.transports.File({
            filename: `${__dirname}/../log/info.log`,
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'DD-MM-YYYY hh:mm:ss A ZZ'
                }),
                winston.format.json()
            ),
            handleExceptions: true
        })
    ],
});
if (process.env.NODE_ENV !== 'production') {
    mylogger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}
module.exports = mylogger;