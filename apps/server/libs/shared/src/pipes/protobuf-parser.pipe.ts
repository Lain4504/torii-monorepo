import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { fromJsonString } from '@bufbuild/protobuf';

/**
 * ProtobufParserPipe - Converts snake_case JSON to camelCase Protobuf messages
 * 
 * This pipe handles the conversion from plugNmeet's snake_case JSON API format
 * to TypeScript's camelCase protobuf message objects using @bufbuild/protobuf.
 * 
 * Usage:
 * @Post('create')
 * async create(@Body(new ProtobufParserPipe(CreateRoomReqSchema)) body: CreateRoomReq) {
 *   // body is now a properly typed protobuf message with camelCase properties
 * }
 */
@Injectable()
export class ProtobufParserPipe implements PipeTransform {
    constructor(private readonly schema: any) { }

    transform(value: any, metadata: ArgumentMetadata) {
        try {
            // If value is already a string, use it directly
            // If it's an object, stringify it first (NestJS may have already parsed it)
            const jsonString = typeof value === 'string' ? value : JSON.stringify(value);

            // Use fromJsonString to convert snake_case JSON → camelCase protobuf message
            return fromJsonString(this.schema, jsonString, { ignoreUnknownFields: true });
        } catch (error) {
            throw new BadRequestException(
                `Invalid protobuf data: ${error.message}`
            );
        }
    }
}
