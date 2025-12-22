import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    // If it's already an RpcException, just throw it
    if (exception instanceof RpcException) {
      return throwError(() => exception);
    }

    // If it's an HttpException (like BadRequestException from ValidationPipe)
    if (exception.getStatus && exception.getResponse) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      
      let message = 'Internal server error';
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        // Handle validation errors
        if (Array.isArray((response as any).message)) {
          message = (response as any).message.join(', ');
        } else {
          message = (response as any).message || exception.message || 'Internal server error';
        }
      }

      return throwError(
        () =>
          new RpcException({
            status,
            message,
          }),
      );
    }

    // For other errors, wrap in RpcException
    return throwError(
      () =>
        new RpcException({
          status: 500,
          message: exception?.message || 'Internal server error',
        }),
    );
  }
}





