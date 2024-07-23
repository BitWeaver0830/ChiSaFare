const logger = require('../utils/winston/winston');

const errorHandler = (err, req, res, next)=>{
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || 'something went wrong - no message from error';
    logger.error(errMsg);
    res.status(errStatus).json({
        status: errStatus,
        message: errMsg
    })
}

module.exports = errorHandler;