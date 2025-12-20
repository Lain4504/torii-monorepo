import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnsupportedMediaTypeException,
  mixin,
  Type,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { fromBinary, toBinary, Message } from '@bufbuild/protobuf';
import type { GenMessage } from '@bufbuild/protobuf/codegenv2';

/**
 * ProtobufInterceptor for @bufbuild/protobuf
 * Uses GenMessage which is the actual type of *Schema objects
 */
export function ProtobufInterceptor<T extends Message, R extends Message>(
  ReqSchema: GenMessage<T>,
  ResSchema: GenMessage<R> | null = null,
): Type<NestInterceptor> {
  @Injectable()
  class MixinProtobufInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const http = context.switchToHttp();
      const req = http.getRequest<Request>();

      const contentType = req.headers['content-type']?.toLowerCase();

      // Enforce Protobuf
      if (contentType !== 'application/protobuf') {
        throw new UnsupportedMediaTypeException(
          'Only application/protobuf is supported',
        );
      }

      // Check if body is raw buffer
      if (!(req.body instanceof Buffer)) {
        if (!req.body || Object.keys(req.body).length === 0) {
          // Empty body - might be valid for some requests
        }
      }

      if (req.body instanceof Buffer) {
        try {
          // Decode using @bufbuild fromBinary
          req.body = fromBinary(ReqSchema, new Uint8Array(req.body)) as any;
        } catch (e) {
          throw new Error('Failed to decode Protobuf body');
        }
      }

      return next.handle().pipe(
        map((data) => {
          if (ResSchema) {
            // Encode using @bufbuild toBinary
            const buffer = toBinary(ResSchema, data);
            // Set content-type
            context
              .switchToHttp()
              .getResponse<Response>()
              .header('Content-Type', 'application/protobuf');
            return Buffer.from(buffer);
          }

          return data;
        }),
      );
    }
  }

  return mixin(MixinProtobufInterceptor);
}
