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
} from '@workspace/protocol';
import {
    sendProtoJsonResponse,
    sendCommonProtoJsonResponse,
    JwtAuthGuard,
} from '@server/shared';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * FileController handles file-related operations in the Gateway
 * Routes: /file/*
 */
@Controller('file')
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
    @Get('upload')
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

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async handleChunkUpload(
        @Query() query: any,
        @UploadedFile() file: Express.Multer.File,
        @Res() res: Response,
    ) {
        if (!file) {
            return res.status(HttpStatus.BAD_REQUEST).json({ status: false, msg: 'no file part' });
        }

        const req = this.mapResumableQuery(query);
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
    @Post('merge')
    @UseGuards(JwtAuthGuard)
    async handleFileMerge(@Body() body: any, @Res() res: Response) {
        try {
            const req = create(UploadedFileMergeReqSchema, body);
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'file.merge' }, req)
            );

            res.status(HttpStatus.OK);
            sendProtoJsonResponse(res, UploadedFileResSchema, result);
        } catch (error) {
            sendCommonProtoJsonResponse(res, false, error.message);
        }
    }

    /**
     * handleDownloadUploadedFile serves files for download
     */
    @Get('download/:sid/*')
    async handleDownload(@Param('sid') sid: string, @Param('0') filePath: string, @Res() res: Response) {
        const fullPath = path.join(this.uploadPath, sid, filePath);
        if (!fs.existsSync(fullPath)) {
            return res.status(HttpStatus.NOT_FOUND).send('File not found');
        }

        const fileName = path.basename(fullPath);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        // Note: You should set a proper Content-Type here
        res.sendFile(path.resolve(fullPath));
    }

    /**
     * handleConvertWhiteboardFile triggers conversion for whiteboard
     */
    @Post('convert-whiteboard')
    @UseGuards(JwtAuthGuard)
    async handleConvertWhiteboard(@Body() body: any, @Res() res: Response) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'file.convertWhiteboard' }, body)
            );
            return res.status(HttpStatus.OK).json(result);
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({ status: false, msg: error.message });
        }
    }

    @Post('getByType')
    @UseGuards(JwtAuthGuard)
    async handleGetFilesByType(@Body() body: any, @Res() res: Response) {
        try {
            const req = create(GetRoomUploadedFilesReqSchema, body);
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'file.getByType' }, req)
            );
            return res.status(HttpStatus.OK).json({ status: true, files: result });
        } catch (error) {
            return res.status(HttpStatus.BAD_REQUEST).json({ status: false, msg: error.message });
        }
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
