import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

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



    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody: ApiResponseDto<null> & { statusCode: number } = {
      success: false,
      message: exception instanceof HttpException ? exception.message : 'Internal server error',
      error: (exception as any).response?.message || (exception as any).message || 'Unknown error',
      data: null,
      statusCode: httpStatus,
    };

    this.logger.error(`Exception: ${JSON.stringify(responseBody)}`);

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
