import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { HttpAdapterHost } from '@nestjs/core';
import { ApiResponseDto } from '@workspace/dtos';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorMessage = 'Unknown error';

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      message = exception.message;
      const response = exception.getResponse();
      errorMessage = typeof response === 'string' ? response : (response as any)?.message || exception.message;
    } else if (exception instanceof RpcException) {
      const error = exception.getError();
      if (typeof error === 'object' && error !== null) {
        httpStatus = (error as any).status || HttpStatus.INTERNAL_SERVER_ERROR;
        message = (error as any).message || 'Internal server error';
        errorMessage = message;
      } else {
        errorMessage = typeof error === 'string' ? error : 'Unknown error';
        message = errorMessage;
      }
    } else {
      // Log unknown exceptions for debugging
      this.logger.error('Unknown exception:', exception);
      const anyException = exception as any;
      errorMessage = anyException?.message || anyException?.toString() || 'Unknown error';
    }

    const responseBody: ApiResponseDto<null> & { statusCode: number } = {
      success: false,
      message,
      error: errorMessage,
      data: null,
      statusCode: httpStatus,
    };

    this.logger.error(`Exception: ${JSON.stringify(responseBody)}`);
    if (!(exception instanceof HttpException || exception instanceof RpcException)) {
      this.logger.error('Exception details:', exception);
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
