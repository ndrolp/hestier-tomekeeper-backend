import fs from 'node:fs';
import path from 'node:path';
import morgan from 'morgan';

const logsDirectory = path.join(process.cwd(), 'logs');
const requestsLogPath = path.join(logsDirectory, 'requests.log');

fs.mkdirSync(logsDirectory, { recursive: true });

const requestLogStream = fs.createWriteStream(requestsLogPath, { flags: 'a' });

export const requestLoggerMiddleware = morgan(
  ':date[iso] :remote-addr - :method :url :status :res[content-length] - :response-time ms',
  {
    stream: requestLogStream,
  },
);
