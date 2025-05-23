const errorMiddleware = (err, req, res, next) => {
    err.message ||= "Internal Server Error";
    err.statusCode ||= 500;

    if(err.code === 11000) {
        const error = Object.keys(err.keyPattern).join(',');
        err.message = `Dublicate field - ${error}`;
        err.statusCode = 500;
    }

    if(err.name === 'CastErrr') {
        const errorPath = err.path;
        err.message = `Invalid format of ${errorPath}`;
        err.statusCode = 400;        
    }

    const response = {
        success: false,
        message: err.message
    }

    return res.status(err.statusCode).json(response)
};

const tryCatch = (passedFunc) => async(req, res, next) => {
    try {
        await passedFunc(req, res, next);
    }
    catch (error) {
        next(error);
    }
};

export { errorMiddleware, tryCatch };