import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';

const load_logger_service = () => {
    const logger = new winston.createLogger({
        format: winston.format.json(),
        transports: [
            new (winston.transports.Console)({
                timestamp: true,
                colorize: true,
            })
       ]
    });
    
    const cloudwatchConfig = {
        logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
        logStreamName: `${process.env.CLOUDWATCH_GROUP_NAME}-${process.env.NODE_ENV}`,
        awsOptions: {
            credentials: {
              accessKeyId: process.env.CLOUDWATCH_ACCESS_KEY,
              secretAccessKey: process.env.CLOUDWATCH_SECRET_ACCESS_KEY,
            },
            region: process.env.CLOUDWATCH_REGION,
          },
        messageFormatter: ({ level, message, additionalInfo }) =>    `[${level}] : ${message} \nAdditional Info: ${JSON.stringify(additionalInfo)}}`
    }

    logger.add(new WinstonCloudWatch(cloudwatchConfig));

    return logger;
}

export default load_logger_service;