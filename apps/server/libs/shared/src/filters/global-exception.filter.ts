import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { errorResponse } from '../utils/api-response.util';

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        if (response.headersSent) {
            return;
        }

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            } else if (typeof res === 'object' && res !== null && 'message' in res) {
                // @ts-ignore
                message = Array.isArray(res.message) ? res.message.join(', ') : res.message;
            }
        } else if (exception instanceof Error) {
            // Handle specific microservice errors or generic errors
            message = exception.message;

            // Map common microservice errors to status codes if needed
            if (message.includes('not found')) {
                status = HttpStatus.NOT_FOUND;
            } else if (message.includes('Forbidden') || message.includes('sensitive')) {
                status = HttpStatus.FORBIDDEN;
            } else if (message.includes('Unauthorized')) {
                status = HttpStatus.UNAUTHORIZED;
            } else if (message.includes('Bad Request') || message.includes('exist') || message.includes('invalid')) {
                status = HttpStatus.BAD_REQUEST;
            }
        }

        // Only log 500 errors as errors, others as warnings/debug
        if (status >= 500) {
            this.logger.error(`Exception on ${request.url}:`, exception);
        } else {
            this.logger.warn(`Exception on ${request.url}: ${message}`);
        }

        response
            .status(status)
            .json(errorResponse(message));
    }
}
