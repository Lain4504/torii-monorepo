import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { errorResponse } from '@server/shared';

/**
 * Global Exception Filter for Identity Module
 * Converts all NestJS exceptions to standard response format
 */
@Catch()
export class IdentityHttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(IdentityHttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'An unexpected error occurred';
        let errors: any[] | undefined = undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;

                // Handle NestJS validation errors
                if (Array.isArray(responseObj.message)) {
                    message = 'Validation failed';
                    errors = responseObj.message;
                } else if (responseObj.message) {
                    message = responseObj.message;
                } else if (responseObj.error) {
                    message = responseObj.error;
                }

                // Include validation errors if available
                if (responseObj.errors && Array.isArray(responseObj.errors)) {
                    errors = responseObj.errors;
                }
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error(
                `Unhandled error: ${exception.message}`,
                exception.stack,
            );
        }

        // Log error for debugging
        this.logger.debug(
            `Exception caught: ${message} (${status}) - ${request.method} ${request.url}`,
        );

        // Return standard format
        const standardResponse = errorResponse(message, errors);
        response.status(status).json(standardResponse);
    }
}

