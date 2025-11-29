import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, query } = request;
        const userAgent = request.get('user-agent') || '';
        const ip = request.ip;

        const now = Date.now();

        this.logger.log(
            `Incoming Request: ${method} ${url} - User Agent: ${userAgent} - IP: ${ip}`,
        );

        if (Object.keys(query).length > 0) {
            this.logger.debug(`Query Parameters: ${JSON.stringify(query)}`);
        }

        if (method !== 'GET' && body && Object.keys(body).length > 0) {
            // Don't log sensitive data like passwords
            const sanitizedBody = { ...body };
            if (sanitizedBody.password) sanitizedBody.password = '***';
            if (sanitizedBody.passwordHash) sanitizedBody.passwordHash = '***';
            this.logger.debug(`Request Body: ${JSON.stringify(sanitizedBody)}`);
        }

        return next.handle().pipe(
            tap({
                next: () => {
                    const response = context.switchToHttp().getResponse();
                    const { statusCode } = response;
                    const delay = Date.now() - now;

                    this.logger.log(
                        `Outgoing Response: ${method} ${url} ${statusCode} - ${delay}ms`,
                    );
                },
                error: (error) => {
                    const delay = Date.now() - now;
                    this.logger.error(
                        `Request Error: ${method} ${url} - ${error.message} - ${delay}ms`,
                    );
                },
            }),
        );
    }
}
