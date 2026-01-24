import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NatsRoomService } from '../../interfaces/nats/nats-room.service';
import { NatsRoomEventsService } from '../../interfaces/nats/nats-room-events.service';
import { NatsSystemEventsService } from '../../interfaces/nats/nats-system-events.service';
import {
    RoomUploadedFileType,
    RoomUploadedFileMetadataSchema,
    UploadedFileMergeReq,
    UploadedFileResSchema,
    UploadBase64EncodedDataReq,
    UploadBase64EncodedDataResSchema,
    ChatMessageSchema,
    NatsMsgServerToClientEvents
} from '@workspace/protocol';
import { create, toJsonString } from '@bufbuild/protobuf';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';

const execPromise = promisify(exec);

export interface ResumableUploadReq {
    roomSid: string;
    roomId: string;
    userId: string;
    resumableChunkNumber: number;
    resumableTotalChunks: number;
    resumableTotalSize: number;
    resumableIdentifier: string;
    resumableFilename: string;
    resumableCurrentChunkSize: number;
}

@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name);
    private readonly uploadPath: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly natsRoom: NatsRoomService,
        private readonly natsRoomEvents: NatsRoomEventsService,
        private readonly natsSystemEvents: NatsSystemEventsService,
    ) {
        this.uploadPath = this.configService.get<string>('UPLOAD_FILE_PATH') || './uploads';
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    /**
     * ResumableFileUpload handles chunked uploads from resumable.js
     */
    async resumableFileUpload(req: ResumableUploadReq, method: string, file?: Express.Multer.File): Promise<any> {
        this.logger.debug(`ResumableFileUpload: ${method} for room ${req.roomId}, chunk ${req.resumableChunkNumber}`);

        const tempFolder = path.join(this.uploadPath, req.roomSid, 'tmp');
        const chunkDir = path.join(tempFolder, req.resumableIdentifier);
        const chunkPath = path.join(chunkDir, `part${req.resumableChunkNumber}`);

        if (method === 'GET') {
            if (fs.existsSync(chunkPath)) {
                const stats = fs.statSync(chunkPath);
                if (stats.size === Number(req.resumableCurrentChunkSize)) {
                    return { status: true, msg: 'part_already_uploaded', code: 201 };
                }
                fs.unlinkSync(chunkPath);
            }
            return { status: true, msg: 'ok_to_upload', code: 204 };
        }

        if (method === 'POST') {
            if (!file) {
                throw new Error('No file provided in POST request');
            }

            if (req.resumableChunkNumber === 1) {
                // Check if room is active
                const roomInfo = await this.natsRoom.getRoomInfo(req.roomId);
                if (!roomInfo || roomInfo.status === 'ended') {
                    throw new Error('Room is not active');
                }
                // Check max size
                const maxSizeMb = this.configService.get<number>('UPLOAD_MAX_SIZE') || 100;
                if (req.resumableTotalSize > maxSizeMb * 1024 * 1024) {
                    throw new Error(`File too large: max allowed is ${maxSizeMb}MB`);
                }
            }

            if (!fs.existsSync(chunkDir)) {
                fs.mkdirSync(chunkDir, { recursive: true });
            }

            fs.writeFileSync(chunkPath, file.buffer);
            return { status: true, msg: 'part_uploaded', code: 200 };
        }
    }

    /**
     * UploadBase64EncodedData handles base64 encoded file uploads
     */
    async uploadBase64EncodedData(req: UploadBase64EncodedDataReq & { requestedUserId?: string, requestedUserName?: string }): Promise<any> {
        this.logger.debug(`UploadBase64EncodedData for file ${req.fileName} in room ${req.roomId}`);

        const roomInfo = await this.natsRoom.getRoomInfo(req.roomId);
        if (!roomInfo) {
            throw new Error('Room not found');
        }

        const roomSid = roomInfo.roomSid;
        const roomId = roomInfo.roomId;

        const uploadDir = path.join(this.uploadPath, roomSid);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const safeFilename = path.basename(req.fileName);
        const finalPath = path.join(uploadDir, safeFilename);
        const buffer = Buffer.from(req.data, 'base64');

        fs.writeFileSync(finalPath, buffer);

        const fileId = uuidv4();
        const relativePath = path.join(roomSid, safeFilename);
        const mimeType = this.getMimeType(safeFilename);

        const meta = create(RoomUploadedFileMetadataSchema, {
            fileId,
            fileName: safeFilename,
            filePath: relativePath,
            fileType: req.fileType,
            mimeType,
        });
        await this.natsRoom.addRoomFile(roomId, meta);

        if (req.fileType === RoomUploadedFileType.CHAT_FILE) {
            this.publishChatMsgForFile(
                roomId,
                req.requestedUserId || '',
                req.requestedUserName || '',
                relativePath,
                safeFilename,
                mimeType
            ).catch(err => this.logger.error(`Failed to publish chat msg for file: ${err.message}`));
        }

        return create(UploadBase64EncodedDataResSchema, {
            status: true,
            msg: 'file uploaded successfully',
            filePath: relativePath,
            fileName: safeFilename,
            fileMimeType: mimeType,
            fileExtension: path.extname(safeFilename).replace('.', ''),
        });
    }

    /**
     * UploadedFileMerge combines all chunks into a final file
     */
    async uploadedFileMerge(req: UploadedFileMergeReq & { requestedUserId?: string, requestedUserName?: string }): Promise<any> {
        const safeFilename = path.basename(req.resumableFilename);
        const tempFolder = path.join(this.uploadPath, req.roomSid, 'tmp');
        const chunkDir = path.join(tempFolder, req.resumableIdentifier);

        if (!fs.existsSync(chunkDir)) {
            throw new Error(`Chunks not found for identifier ${req.resumableIdentifier}`);
        }

        const uploadDir = path.join(this.uploadPath, req.roomSid);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const finalPath = path.join(uploadDir, safeFilename);
        const writeStream = fs.createWriteStream(finalPath);

        for (let i = 1; i <= req.resumableTotalChunks; i++) {
            const chunkPath = path.join(chunkDir, `part${i}`);
            if (!fs.existsSync(chunkPath)) {
                throw new Error(`Chunk ${i} missing`);
            }
            const data = fs.readFileSync(chunkPath);
            writeStream.write(data);
        }
        writeStream.end();

        // Wait for write stream to finish
        await new Promise((resolve) => writeStream.on('finish', () => resolve(true)));

        // Delete chunks
        this.deleteFolderRecursive(chunkDir);

        const fileId = uuidv4();
        const relativePath = path.join(req.roomSid, safeFilename);

        // Determine mime type
        const mimeType = this.getMimeType(safeFilename);

        if (req.fileType !== RoomUploadedFileType.WHITEBOARD_CONVERTED_FILE) {
            const meta = create(RoomUploadedFileMetadataSchema, {
                fileId,
                fileName: safeFilename,
                filePath: relativePath,
                fileType: req.fileType,
                mimeType,
            });
            await this.natsRoom.addRoomFile(req.roomId, meta);
        }

        const response = create(UploadedFileResSchema, {
            status: true,
            msg: 'file uploaded successfully',
            fileId,
            fileType: req.fileType,
            fileMimeType: mimeType,
            filePath: relativePath,
            fileName: safeFilename,
            fileExtension: path.extname(safeFilename).replace('.', ''),
        });

        if (req.fileType === RoomUploadedFileType.CHAT_FILE) {
            this.publishChatMsgForFile(
                req.roomId,
                req.requestedUserId || '',
                req.requestedUserName || '',
                relativePath,
                safeFilename,
                mimeType
            ).catch(err => this.logger.error(`Failed to publish chat msg for file: ${err.message}`));
        }

        // If it's an office file, we might want to start conversion
        if (req.fileType === RoomUploadedFileType.WHITEBOARD_CONVERTED_FILE) {
            // Trigger conversion (don't await to avoid blocking response)
            this.convertAndBroadcastWhiteboardFile(req.roomId, req.roomSid, relativePath).catch(err => {
                this.logger.error(`Whiteboard conversion failed: ${err.message}`);
            });
        }

        return response;
    }

    /**
     * ConvertAndBroadcastWhiteboardFile converts files for whiteboard using office and muPDF
     */
    async convertAndBroadcastWhiteboardFile(roomId: string, roomSid: string, filePath: string): Promise<any> {
        this.logger.log(`ConvertAndBroadcastWhiteboardFile: ${filePath} for room ${roomId}`);

        const fullPath = path.join(this.uploadPath, filePath);
        if (!fs.existsSync(fullPath)) {
            throw new Error('File not found');
        }

        const fileId = uuidv4();
        const outputDir = path.join(this.uploadPath, roomSid, fileId);
        fs.mkdirSync(outputDir, { recursive: true });

        const fileName = path.basename(filePath);
        const ext = path.extname(fileName).toLowerCase();

        let pdfPath = fullPath;
        if (ext !== '.pdf') {
            // Convert to PDF using soffice (LibreOffice)
            try {
                await execPromise(`soffice --headless --invisible --nologo --nolockcheck --convert-to pdf --outdir "${outputDir}" "${fullPath}"`);
                const pdfName = path.basename(fileName, ext) + '.pdf';
                pdfPath = path.join(outputDir, pdfName);
            } catch (error) {
                this.logger.error(`soffice conversion failed: ${error.message}`);
                throw new Error('Failed to convert file to PDF');
            }
        }

        // Convert PDF to images using mutool
        try {
            await execPromise(`mutool convert -O resolution=300 -o "${path.join(outputDir, 'page_%d.png')}" "${pdfPath}"`);
        } catch (error) {
            this.logger.error(`mutool conversion failed: ${error.message}`);
            throw new Error('Failed to convert PDF to images');
        }

        // Count pages
        const files = fs.readdirSync(outputDir);
        const pages = files.filter(f => f.startsWith('page_') && f.endsWith('.png')).length;

        const res = {
            status: true,
            msg: 'success',
            fileName,
            filePath: path.join(roomSid, fileId),
            fileId,
            totalPages: pages,
        };

        // Store in NATS
        const meta = create(RoomUploadedFileMetadataSchema, {
            fileId,
            fileName,
            filePath: res.filePath,
            fileType: RoomUploadedFileType.WHITEBOARD_CONVERTED_FILE,
            totalPages: pages,
        });
        await this.natsRoom.addRoomFile(roomId, meta);

        return res;
    }

    /**
     * GetRoomFilesByType retrieves file metadata for a room filtered by type
     */
    async getRoomFilesByType(roomId: string, fileType: RoomUploadedFileType): Promise<any[]> {
        const allFiles = await this.natsRoom.getAllRoomFiles(roomId);
        const filtered = Object.values(allFiles).filter(f => (f as any).fileType === fileType);
        return filtered;
    }

    /**
     * DownloadAndProcessPreUploadWBfile downloads a file from URL and processes it for whiteboard
     */
    async downloadAndProcessPreUploadWBfile(roomId: string, roomSid: string, fileUrl: string): Promise<any> {
        this.logger.log(`Downloading and processing pre-upload whiteboard file: ${fileUrl}`);

        const downloadDir = path.join(this.uploadPath, roomSid);
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        const fileName = path.basename(new URL(fileUrl).pathname) || 'preloaded.pdf';
        const downloadPath = path.join(downloadDir, fileName);

        // Download file
        try {
            const response = await axios({
                method: 'GET',
                url: fileUrl,
                responseType: 'stream',
                timeout: 30000,
            });

            const writer = fs.createWriteStream(downloadPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(true));
                writer.on('error', reject);
            });
        } catch (error) {
            this.logger.error(`Failed to download file from ${fileUrl}: ${error.message}`);
            throw new Error(`Failed to download whiteboard file: ${error.message}`);
        }

        // Process file (convert and broadcast)
        const filePath = path.join(roomSid, fileName);
        return this.convertAndBroadcastWhiteboardFile(roomId, roomSid, filePath);
    }

    /**
     * DeleteRoomUploadedDir deletes all uploaded files for a room session
     */
    async deleteRoomUploadedDir(roomSid: string): Promise<void> {
        const roomDir = path.join(this.uploadPath, roomSid);
        if (fs.existsSync(roomDir)) {
            this.logger.log(`Deleting uploaded files directory for room session: ${roomSid}`);
            this.deleteFolderRecursive(roomDir);
        }
    }

    private deleteFolderRecursive(folderPath: string) {
        if (fs.existsSync(folderPath)) {
            fs.readdirSync(folderPath).forEach((file) => {
                const curPath = path.join(folderPath, file);
                if (fs.lstatSync(curPath).isDirectory()) {
                    this.deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(folderPath);
        }
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
        };
        return mimes[ext] || 'application/octet-stream';
    }

    private async publishChatMsgForFile(
        roomId: string,
        userId: string,
        userName: string,
        filePath: string,
        fileName: string,
        mimeType: string
    ) {
        if (!userId || !userName) {
            return;
        }

        const serverUrl = this.configService.get<string>('SERVER_URL') || 'http://localhost:8080';
        const isImage = mimeType.startsWith('image/');

        const downloadUrl = `${serverUrl}/download/uploadedFile/${filePath}`;
        let html = `<a class="attachment-message flex items-center gap-3 break-all" href="${downloadUrl}" target="_blank" rel="noreferrer">
    <span class="h-10 w-10 rounded-xl bg-muted flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M3 12.1817C2.09551 11.5762 1.5 10.5452 1.5 9.375C1.5 7.61732 2.84363 6.17347 4.55981 6.01453C4.91086 3.8791 6.76518 2.25 9 2.25C11.2348 2.25 13.0891 3.8791 13.4402 6.01453C15.1564 6.17347 16.5 7.61732 16.5 9.375C16.5 10.5452 15.9045 11.5762 15 12.1817M6 12.75L9 15.75M9 15.75L12 12.75M9 15.75V9" stroke="#0C131A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span><span class="flex-1">${fileName}</span></a>`;

        if (isImage) {
            html += `<img class="chat-image max-w-full rounded-lg cursor-pointer mt-2" src="${downloadUrl}" alt="${fileName}" />`;
        }

        const chatMsg = create(ChatMessageSchema, {
            id: uuidv4(),
            fromName: userName,
            fromUserId: userId,
            sentAt: Date.now().toString(),
            message: html,
            isPrivate: false,
        });

        await this.natsSystemEvents.broadcastChatEntry(
            roomId,
            chatMsg
        );
    }
}
