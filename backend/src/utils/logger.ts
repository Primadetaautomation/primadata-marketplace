import pino from 'pino';
import pretty from 'pino-pretty';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug');

const stream = isProduction
  ? undefined
  : pretty({
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    });

export const logger = pino(
  {
    level: logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        path: req.path,
        parameters: req.parameters,
        headers: req.headers,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
      err: pino.stdSerializers.err,
    },
  },
  stream
);

export default logger;