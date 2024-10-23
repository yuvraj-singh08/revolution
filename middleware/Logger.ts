import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
//  LOGGER EVENT TYPES

// USER_ACTION - for all user related events




class Logger {
    private logger: winston.Logger;

    constructor() {
        const transport = new DailyRotateFile({
            filename: path.join(__dirname, 'logs', '%DATE%.json'),
            datePattern: 'DD-MM-YYYY',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        });

        this.logger = winston.createLogger({
            level: 'info',
            transports: [transport]
        });
    }

    public logEvent(id: string, event: string): void {
        this.logger.info({ id, event });
    }
}



export default Logger;