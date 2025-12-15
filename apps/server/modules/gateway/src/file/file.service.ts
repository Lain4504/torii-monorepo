import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name);
    private readonly uploadDir: string;

    constructor(private readonly configService: ConfigService) {
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async handleUploadChunk(query: any, file: any) {
        // Query params from Resumable.js
        const {
            resumableChunkNumber,
            resumableIdentifier,
            resumableFilename,
            resumableTotalChunks,
            roomSid,
        } = query;

        if (!roomSid || !resumableIdentifier) {
            throw new BadRequestException('Missing roomSid or identifier');
        }

        const tempDir = path.join(this.uploadDir, roomSid, 'tmp', resumableIdentifier);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const chunkPath = path.join(tempDir, `part${resumableChunkNumber}`);
        fs.writeFileSync(chunkPath, file.buffer);

        this.logger.log(`Uploaded chunk ${resumableChunkNumber} for ${resumableFilename}`);
        return { status: 'part_uploaded' };
    }

    async checkChunk(query: any) {
        const { resumableChunkNumber, resumableIdentifier, roomSid } = query;
        const chunkPath = path.join(this.uploadDir, roomSid, 'tmp', resumableIdentifier, `part${resumableChunkNumber}`);

        if (fs.existsSync(chunkPath)) {
            return true; // Found
        }
        return false; // Not found
    }

    async mergeFile(body: any): Promise<{ filePath: string; fileName: string; size: number }> {
        const { resumableIdentifier, resumableFilename, resumableTotalChunks, roomSid } = body;
        const tempDir = path.join(this.uploadDir, roomSid, 'tmp', resumableIdentifier);
        const finalDir = path.join(this.uploadDir, roomSid);
        const uniqueName = `${uuidv4()}_${resumableFilename}`;
        const destPath = path.join(finalDir, uniqueName);

        if (!fs.existsSync(finalDir)) {
            fs.mkdirSync(finalDir, { recursive: true });
        }

        if (!fs.existsSync(tempDir)) {
            throw new BadRequestException('Chunks not found');
        }

        const writeStream = fs.createWriteStream(destPath);

        for (let i = 1; i <= parseInt(resumableTotalChunks); i++) {
            const chunkPath = path.join(tempDir, `part${i}`);
            if (!fs.existsSync(chunkPath)) {
                writeStream.close();
                throw new BadRequestException(`Missing chunk ${i}`);
            }
            const data = fs.readFileSync(chunkPath);
            writeStream.write(data);
        }

        writeStream.end();

        // Cleanup
        fs.rmSync(tempDir, { recursive: true, force: true });

        const stat = fs.statSync(destPath);

        return {
            filePath: destPath,
            fileName: uniqueName,
            size: stat.size,
        };
    }

    getFilePath(sid: string, ...parts: string[]) {
        // Validation needed to prevent traversal
        const safePath = path.join(this.uploadDir, sid, ...parts);
        if (!safePath.startsWith(path.resolve(this.uploadDir))) {
            throw new BadRequestException('Invalid path');
        }
        return safePath;
    }
}
