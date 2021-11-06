import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Intercepts a request in three stages: start, end and error,
 * and logs it's stage
 */
@Injectable()
export default class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        this.logRequest(context);

        const now = Date.now();

        return next.handle().pipe(
            tap({
                next: (val: unknown): void => {
                    this.logResponse(val, now, context);
                },
                error: (err: Error): void => {
                    this.logError(context, err);
                },
            })
        );
    }

    private logError(context: ExecutionContext, error: Error): void {
        const req: Request = context.switchToHttp().getRequest();
        const { method, url } = req;
        const message = `Error in - ${method} - ${url}`;

        this.logger.error(message, error.stack);
    }

    private logRequest(context: ExecutionContext): void {
        const req: Request = context.switchToHttp().getRequest();
        const { method, url, body } = req;
        const message = `Incoming request - ${method} - ${url}`;

        this.logger.log(message, method, body);
    }

    private logResponse(response: unknown, now: number, context: ExecutionContext): void {
        const res: Response = context.switchToHttp().getResponse();
        const { statusCode } = res;
        const message = `Response - ${statusCode} - time: ${now}`;

        this.logger.log(message, response);
    }
}
