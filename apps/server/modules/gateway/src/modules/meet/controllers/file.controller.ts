import {
    Controller,
    Get,
    Post,
    Body,
    Req,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    UploadedFile,
    UseInterceptors,
    Logger,
    Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { create, fromBinary } from '@bufbuild/protobuf';
import {
    UploadedFileMergeReq,
    UploadedFileMergeReqSchema,
    UploadedFileResSchema,
    GetRoomUploadedFilesReq,
    GetRoomUploadedFilesReqSchema,
    GetRoomUploadedFilesResSchema,
    UploadBase64EncodedDataReqSchema,
    UploadBase64EncodedDataResSchema,
} from '@workspace/protocol';
import {
    sendProtoJsonResponse,
    sendProtobufResponse,
    sendCommonProtoJsonResponse,
    sendCommonProtobufResponse,
    JwtAuthGuard,
} from '@server/shared';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * FileController handles file-related operations in the Gateway
 * Routes: /file/*
 */
@Controller()
export class FileController {
    private readonly logger = new Logger(FileController.name);
    private readonly uploadPath: string;

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
        private readonly configService: ConfigService,
    ) {
        this.uploadPath = this.configService.get<string>('UPLOAD_FILE_PATH') || './uploads';
    }

    /**
     * handleFileUpload handles resumable.js chunked uploads
     * GET: check if chunk exists
     * POST: upload chunk
     */
    @Get('api/fileUpload')
    @UseGuards(JwtAuthGuard)
    async handleChunkCheck(@Query() query: any, @Res() res: Response) {
        const req = this.mapResumableQuery(query);
        const tempFolder = path.join(this.uploadPath, req.roomSid, 'tmp');
        const chunkDir = path.join(tempFolder, req.resumableIdentifier);
        const chunkPath = path.join(chunkDir, `part${req.resumableChunkNumber}`);

        if (fs.existsSync(chunkPath)) {
            const stats = fs.statSync(chunkPath);
            if (stats.size === Number(req.resumableCurrentChunkSize)) {
                return res.status(HttpStatus.CREATED).send('part_already_uploaded');
            }
            fs.unlinkSync(chunkPath);
        }
        return res.status(HttpStatus.NO_CONTENT).send('ok_to_upload');
    }

    @Post('api/fileUpload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async handleChunkUpload(
        @Query() query: any,
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response,
    ) {
        if (!file) {
            return res.status(HttpStatus.BAD_REQUEST).json({ status: false, msg: 'no file part' });
        }

        // Resumable.js sends params in body for POST requests
        const params = { ...query, ...body };
        const req = this.mapResumableQuery(params);

        if (!req.resumableIdentifier || !req.roomSid) {
            return res.status(HttpStatus.BAD_REQUEST).json({ status: false, msg: 'missing resumable parameters' });
        }

        const tempFolder = path.join(this.uploadPath, req.roomSid, 'tmp');
        const chunkDir = path.join(tempFolder, req.resumableIdentifier);
        const chunkPath = path.join(chunkDir, `part${req.resumableChunkNumber}`);

        if (!fs.existsSync(chunkDir)) {
            fs.mkdirSync(chunkDir, { recursive: true });
        }

        fs.writeFileSync(chunkPath, file.buffer);
        return res.status(HttpStatus.OK).send('part_uploaded');
    }

    /**
     * handleFileMerge merges chunks into a final file
     */
    @Post('api/uploadedFileMerge')
    @UseGuards(JwtAuthGuard)
    async handleFileMerge(@Body() body: any, @Res() res: Response) {
        try {
            let req: UploadedFileMergeReq;
            if (Buffer.isBuffer(body)) {
                req = fromBinary(UploadedFileMergeReqSchema, body);
            } else {
                req = create(UploadedFileMergeReqSchema, body);
            }

            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'file.merge' }, {
                    ...req,
                    requestedUserId: (res.req as any).requestedUserId,
                    requestedUserName: (res.req as any).requestedUserName,
                })
            );

            res.status(HttpStatus.OK);
            sendProtobufResponse(res, UploadedFileResSchema, result);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error.message);
        }
    }

    /**
     * handleUploadBase64 handles base64 encoded file uploads
     */
    @Post('api/uploadBase64EncodedData')
    @UseGuards(JwtAuthGuard)
    async handleUploadBase64(@Req() req: Request, @Body() body: any, @Res() res: Response) {
        try {
            let protoReq: any;
            if (Buffer.isBuffer(body)) {
                protoReq = fromBinary(UploadBase64EncodedDataReqSchema, body);
            } else {
                protoReq = create(UploadBase64EncodedDataReqSchema, body);
            }
            protoReq.roomId = (req as any).roomId;

            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'file.uploadBase64' }, {
                    ...protoReq,
                    requestedUserId: (req as any).requestedUserId,
                    requestedUserName: (req as any).requestedUserName,
                })
            );

            res.status(HttpStatus.OK);
            sendProtobufResponse(res, UploadBase64EncodedDataResSchema, result);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error.message);
        }
    }

    /**
     * handleDownloadUploadedFile serves files for download
     */
    @Get('download/uploadedFile/*path')
    async handleDownload(@Param('path') filePath: string | string[], @Res() res: Response) {
        const pathStr = Array.isArray(filePath) ? filePath.join('/') : filePath;
        const fullPath = path.join(this.uploadPath, pathStr);

        if (!fs.existsSync(fullPath) || fs.lstatSync(fullPath).isDirectory()) {
            return res.status(HttpStatus.NOT_FOUND).send('File not found');
        }

        const fileName = path.basename(fullPath);
        const mimeType = this.getMimeType(fileName);
        const isImage = mimeType.startsWith('image/');

        // Always set to attachment
        const encodedFileName = encodeURIComponent(fileName);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
        );
        res.setHeader('Content-Type', mimeType);

        res.sendFile(path.resolve(fullPath));
    }

    /**
     * handleConvertWhiteboardFile triggers conversion for whiteboard
     */
    @Post('api/whiteboard/convertAndBroadcast')
    @UseGuards(JwtAuthGuard)
    async handleConvertWhiteboard(@Body() body: any, @Res() res: Response) {
        try {
            let data: any = body;
            if (Buffer.isBuffer(body)) {
                // Since this is likely a JSON object encoded in a buffer if it's conversion info
                // or it could be a proto if we had one.
                // For now, let's try JSON if it's a buffer and not matched elsewhere.
                try {
                    data = JSON.parse(body.toString());
                } catch (e) {
                    data = body;
                }
            }
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'file.convertWhiteboard' }, data)
            );
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({ status: false, msg: error.message });
        }
    }

    @Post('api/getRoomFilesByType')
    @UseGuards(JwtAuthGuard)
    async handleGetFilesByType(@Body() body: any, @Res() res: Response) {
        try {
            let req: GetRoomUploadedFilesReq;
            if (Buffer.isBuffer(body)) {
                req = fromBinary(GetRoomUploadedFilesReqSchema, body);
            } else {
                req = create(GetRoomUploadedFilesReqSchema, body);
            }

            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'file.getByType' }, req)
            );

            res.status(HttpStatus.OK);
            sendProtobufResponse(res, GetRoomUploadedFilesResSchema, result);
        } catch (error) {
            sendCommonProtobufResponse(res, false, error.message);
        }
    }

    /**
     * handleListOfficeFiles serves whiteboard converted images
     */
    @Get('api/whiteboard/listOfficeFiles/*path')
    async handleListOfficeFiles(@Param('path') filePath: string | string[], @Res() res: Response) {
        const pathStr = Array.isArray(filePath) ? filePath.join('/') : filePath;
        const fullPath = path.join(this.uploadPath, pathStr);

        if (!fs.existsSync(fullPath) || fs.lstatSync(fullPath).isDirectory()) {
            return res.status(HttpStatus.NOT_FOUND).send('File not found');
        }

        const fileName = path.basename(fullPath);
        res.setHeader('Content-Type', this.getMimeType(fileName));
        res.sendFile(path.resolve(fullPath));
    }

    private getMimeType(filename: string): string {
        const ext = path.extname(filename).toLowerCase();
        const mimes: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.txt': 'text/plain',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.svg': 'image/svg+xml',
            '.webp': 'image/webp',
        };
        return mimes[ext] || 'application/octet-stream';
    }

    private mapResumableQuery(query: any) {
        return {
            roomSid: query.roomSid,
            roomId: query.roomId,
            userId: query.userId,
            resumableChunkNumber: Number(query.resumableChunkNumber),
            resumableTotalChunks: Number(query.resumableTotalChunks),
            resumableTotalSize: Number(query.resumableTotalSize),
            resumableIdentifier: query.resumableIdentifier,
            resumableFilename: query.resumableFilename,
            resumableCurrentChunkSize: Number(query.resumableCurrentChunkSize),
        };
    }
}
