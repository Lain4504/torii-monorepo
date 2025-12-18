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

/**
 * ProtoMessage interface for ts-proto generated types
 * ts-proto generates encode/decode methods by default
 * fromJSON/toJSON are only generated if outputJsonMethods=true is set
 */
export interface ProtoMessage<T> {
  encode(message: T): { finish(): Uint8Array };
  decode(input: Uint8Array): T;
}

export function ProtobufInterceptor<T extends object>(
  ReqClass: ProtoMessage<T>,
  ResClass: ProtoMessage<any> | null = null, // Optional response class customization
): Type<NestInterceptor> {
  @Injectable()
  class MixinProtobufInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      const http = context.switchToHttp();
      const req = http.getRequest<Request>();

      const contentType = req.headers['content-type']?.toLowerCase();

      // Enforce Protobuf
      if (contentType !== 'application/protobuf') {
        // Alternatively, we could fallback to JSON if legacy support was needed,
        // but the plan says "Strictly speak Protobuf".
        throw new UnsupportedMediaTypeException(
          'Only application/protobuf is supported',
        );
      }

      // Check if body is raw buffer
      // Note: Needs strict body parser config to ensure we get Buffer
      if (!(req.body instanceof Buffer)) {
        // If body parser parsed it as something else or it's empty
        if (!req.body || Object.keys(req.body).length === 0) {
          // Empty body is valid for some requests?
          // If we expect Protobuf, we expect bytes.
        } else {
          // If it's not a buffer, we can't decode it efficiently with ts-proto's decode.
          // However, if we received JSON and bodyParser parsed it, strict mode should forbid it.
          // If we received Buffer BUT bodyParser wasn't configured for application/protobuf,
          // it might be empty or wrong.
        }
      }

      if (req.body instanceof Buffer) {
        try {
          // Decode
          req.body = ReqClass.decode(new Uint8Array(req.body));
        } catch (e) {
          throw new Error('Failed to decode Protobuf body');
        }
      }

      return next.handle().pipe(
        map((data) => {
          // Serialize response
          // If ResClass is provided, use it. Otherwise, assume data has .encode() method?
          // Or assume data is the object and we need to use a Class to encode it?
          // ts-proto classes usually have static encode.
          // If the controller returns a POJO, we need the Class to encode it.
          // If the controller returns an instance of the Proto Class, we might check instanceof?
          // BUT ts-proto classes are just interfaces + static module.

          if (ResClass) {
            const buffer = ResClass.encode(data).finish();
            // Set content-type
            context
              .switchToHttp()
              .getResponse<Response>()
              .header('Content-Type', 'application/protobuf');
            return Buffer.from(buffer);
          }

          // If no ResClass provided, and data has encode function?
          // Likely we should always provide ResClass or standard response wrapper.
          return data;
        }),
      );
    }
  }

  return mixin(MixinProtobufInterceptor);
}
