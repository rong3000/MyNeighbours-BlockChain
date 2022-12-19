export function loadProcessErrorProcessors(logger) {
    process.on('unhandledRejection', error => {
        throw error
    });
      
    process.on('uncaughtException', error => {
        logger.log('error', error.message);
        process.exit(1);
    });
}

const use_global_error_handler_middleware = (app) => {
    app.use((error, request, response, next) => {
        response.status(error.status || 500).send({ message: error.message, stack: error.stack });
    });
}

export default use_global_error_handler_middleware;