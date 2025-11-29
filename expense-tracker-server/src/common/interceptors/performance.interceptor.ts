import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Response>();
          const { statusCode } = response;
          const responseTime = Date.now() - startTime;

          // Log request details
          this.logger.log(
            `${method} ${url} ${statusCode} ${responseTime}ms - ${userAgent} ${ip}`,
          );

          // Warn on slow requests (> 1 second)
          if (responseTime > 1000) {
            this.logger.warn(
              `⚠️ Slow request detected: ${method} ${url} took ${responseTime}ms`,
            );
          }
        },
        error: (error: Error & { status?: number }) => {
          const responseTime = Date.now() - startTime;
          this.logger.error(
            `❌ ${method} ${url} ${error.status || 500} ${responseTime}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}
