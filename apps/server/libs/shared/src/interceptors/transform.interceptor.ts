import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';
import { GqlContextType } from '@nestjs/graphql';
import { BYPASS_TRANSFORM_KEY } from '../decorators/bypass-transform.decorator';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private reflector: Reflector) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const bypass = this.reflector.get<boolean>(
      BYPASS_TRANSFORM_KEY,
      context.getHandler(),
    );

    if (bypass) {
      return next.handle();
    }

    // Ignore GraphQL requests
    if (context.getType<GqlContextType>() === 'graphql') {
      return next.handle();
    }
    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: 'Operation successful',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
