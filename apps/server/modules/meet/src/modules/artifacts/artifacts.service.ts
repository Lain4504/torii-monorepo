/**
 * Artifacts Service
 *
 * Manages all room artifacts (analytics, summaries, transcripts, etc.)
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@server/shared';
import { WebhookNotifierService } from '../../infrastructure/webhook/webhook-notifier.service';
import {
    RoomArtifactMetadata,
    RoomArtifactType,
    FetchArtifactsReq,
    FetchArtifactsResult,
    ArtifactInfoRes,
    RoomArtifactMetadataSchema,
    ArtifactInfoSchema,
    FetchArtifactsResultSchema,
    ArtifactInfoResSchema,
    CommonNotifyEventSchema,
} from '@workspace/protocol';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs/promises';
import { create, toJson, fromJson } from '@bufbuild/protobuf';
import { generateTokenForDownloadRecording } from '@server/shared';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ArtifactsService {
    private readonly logger = new Logger(ArtifactsService.name);
    private readonly storagePath: string;
    private readonly apiKey: string;
    private readonly apiSecret: string;
    private readonly tokenValidity: number;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
        private readonly webhookNotifier: WebhookNotifierService,
    ) {
        this.storagePath = this.configService.get<string>('STORAGE_PATH') || './storage';
        this.apiKey = this.configService.get<string>('API_KEY') || '';
        this.apiSecret = this.configService.get<string>('API_SECRET') || '';
        this.tokenValidity = this.configService.get<number>('ARTIFACT_TOKEN_VALIDITY') || 3600; // default 1 hour
    }

    /**
     * buildPath constructs absolute and relative storage paths for artifacts
     */
    async buildPath(fileName: string, roomId: string, artifactType: RoomArtifactType): Promise<{ relativePath: string; absolutePath: string }> {
        const typeStr = RoomArtifactType[artifactType].toLowerCase();
        const relativeDir = path.join(typeStr, roomId);
        const absoluteDir = path.join(this.storagePath, 'artifacts', relativeDir);

        try {
            await fs.mkdir(absoluteDir, { recursive: true });
        } catch (error) {
            this.logger.error(`Failed to create artifact directory: ${error.message}`);
            throw new Error(`failed to create artifact directory: ${error.message}`);
        }

        return {
            relativePath: path.join(relativeDir, fileName),
            absolutePath: path.join(absoluteDir, fileName),
        };
    }

    /**
     * createAndSaveArtifact saves artifact metadata to DB and sends webhooks
     */
    async createAndSaveArtifact(
        roomId: string,
        roomSid: string,
        roomTableId: number,
        artifactType: RoomArtifactType,
        metadata: RoomArtifactMetadata,
        forceSendWebhook = false
    ): Promise<any> {
        const metadataJson = toJson(RoomArtifactMetadataSchema, metadata) as any;

        const artifact = await this.prisma.roomArtifact.create({
            data: {
                artifactId: uuidv4(),
                roomTableId: roomTableId,
                roomId: roomId,
                type: RoomArtifactType[artifactType],
                metadata: metadataJson,
            },
        });

        // Send webhook notification
        await this.sendWebhookNotification('artifact_created', roomSid, artifact, metadata, forceSendWebhook);

        this.logger.log(`Successfully created ${RoomArtifactType[artifactType]} artifact (id: ${artifact.artifactId}) for room ${roomId}`);
        return artifact;
    }

    async createSpeechTranscriptionArtifact(roomTableId: number, roomId: string, roomSid: string, filePath: string, fileSize: number): Promise<void> {
        const metadata = create(RoomArtifactMetadataSchema, {
            fileInfo: {
                filePath,
                fileSize: fileSize.toString(),
            },
        });

        await this.createAndSaveArtifact(roomId, roomSid, roomTableId, RoomArtifactType.SPEECH_TRANSCRIPTION, metadata);
    }

    async createChatTranslationArtifact(roomTableId: number, roomId: string, roomSid: string, filePath: string, fileSize: number): Promise<void> {
        const metadata = create(RoomArtifactMetadataSchema, {
            fileInfo: {
                filePath,
                fileSize: fileSize.toString(),
            },
        });

        await this.createAndSaveArtifact(roomId, roomSid, roomTableId, RoomArtifactType.CHAT_TRANSLATION_USAGE, metadata);
    }

    async createAITextChatArtifact(roomTableId: number, roomId: string, roomSid: string, filePath: string, fileSize: number): Promise<void> {
        const metadata = create(RoomArtifactMetadataSchema, {
            fileInfo: {
                filePath,
                fileSize: fileSize.toString(),
            },
        });

        await this.createAndSaveArtifact(roomId, roomSid, roomTableId, RoomArtifactType.AI_TEXT_CHAT_INTERACTION_USAGE, metadata);
    }

    /**
     * fetchArtifacts retrieves a paginated list of artifacts
     */
    async fetchArtifacts(r: FetchArtifactsReq): Promise<FetchArtifactsResult> {
        const from = parseInt(r.from, 10) || 0;
        const limit = parseInt(r.limit, 10) || 20;

        const where: any = {};
        if (r.roomIds && r.roomIds.length > 0) {
            where.roomId = { in: r.roomIds };
        }
        if (r.roomSid) {
            where.roomInfo = { sid: r.roomSid };
        }
        if (r.type !== undefined && r.type !== RoomArtifactType.UNKNOWN_ARTIFACT) {
            where.type = RoomArtifactType[r.type];
        }

        const artifacts = await this.prisma.roomArtifact.findMany({
            where,
            skip: from,
            take: limit,
            orderBy: { created: r.orderBy === 'ASC' ? 'asc' : 'desc' },
        });

        const totalItems = await this.prisma.roomArtifact.count({ where });

        const resultArtifacts = artifacts.map(a => {
            const metadata = fromJson(RoomArtifactMetadataSchema, a.metadata as any);
            return create(ArtifactInfoSchema, {
                artifactId: a.artifactId,
                roomId: a.roomId,
                type: RoomArtifactType[a.type as keyof typeof RoomArtifactType] || RoomArtifactType.UNKNOWN_ARTIFACT,
                metadata: metadata,
                created: a.created.toISOString(),
            });
        });

        return create(FetchArtifactsResultSchema, {
            artifactsList: resultArtifacts,
            totalArtifacts: totalItems.toString(),
            from: from.toString(),
            limit: limit.toString(),
            orderBy: r.orderBy,
        });
    }

    /**
     * getArtifactInfo retrieves details for a single artifact
     */
    async getArtifactInfo(artifactId: string): Promise<ArtifactInfoRes> {
        const artifact = await this.prisma.roomArtifact.findUnique({
            where: { artifactId },
            include: { roomInfo: true }
        });

        if (!artifact) {
            throw new Error(`artifact not found: ${artifactId}`);
        }

        const metadata = fromJson(RoomArtifactMetadataSchema, artifact.metadata as any);

        const info = create(ArtifactInfoSchema, {
            artifactId: artifact.artifactId,
            roomId: artifact.roomId,
            type: RoomArtifactType[artifact.type as keyof typeof RoomArtifactType] || RoomArtifactType.UNKNOWN_ARTIFACT,
            metadata: metadata,
            created: artifact.created.toISOString(),
        });

        return create(ArtifactInfoResSchema, {
            status: true,
            msg: 'success',
            artifactInfo: info,
        });
    }

    /**
     * getDownloadToken generates a single-use token for downloading an artifact
     */
    async getDownloadToken(artifactId: string): Promise<string> {
        const artifact = await this.prisma.roomArtifact.findUnique({
            where: { artifactId },
        });

        if (!artifact) {
            throw new Error(`artifact not found: ${artifactId}`);
        }

        const artifactType = RoomArtifactType[artifact.type as keyof typeof RoomArtifactType];
        if (!this.isDownloadable(artifactType)) {
            throw new Error('this artifact type is not downloadable');
        }

        const metadata = fromJson(RoomArtifactMetadataSchema, artifact.metadata as any);
        if (!metadata.fileInfo || !metadata.fileInfo.filePath) {
            throw new Error('no file associated with this artifact');
        }

        return generateTokenForDownloadRecording(
            metadata.fileInfo.filePath,
            this.apiKey,
            this.apiSecret,
            this.tokenValidity
        );
    }

    /**
     * verifyAndGetFilePath verifies a download token and returns the absolute file path
     */
    async verifyAndGetFilePath(token: string): Promise<{ absolutePath: string; fileName: string }> {
        try {
            const decoded = jwt.verify(token, this.apiSecret) as any;
            const absolutePath = path.join(this.storagePath, 'artifacts', decoded.filePath);

            try {
                await fs.access(absolutePath);
                return {
                    absolutePath,
                    fileName: path.basename(decoded.filePath),
                };
            } catch (error) {
                throw new Error(`file not found: ${path.basename(absolutePath)}`);
            }
        } catch (error) {
            throw new Error(`token verification failed: ${error.message}`);
        }
    }

    /**
     * deleteArtifact deletes an artifact record and its associated file
     */
    async deleteArtifact(artifactId: string): Promise<boolean> {
        const artifact = await this.prisma.roomArtifact.findUnique({
            where: { artifactId },
        });

        if (!artifact) {
            throw new Error(`artifact not found with ID: ${artifactId}`);
        }

        const metadata = fromJson(RoomArtifactMetadataSchema, artifact.metadata as any);
        if (metadata.fileInfo && metadata.fileInfo.filePath) {
            const absolutePath = path.join(this.storagePath, 'artifacts', metadata.fileInfo.filePath);
            await this.moveToTrash(absolutePath);
        }

        await this.prisma.roomArtifact.delete({
            where: { artifactId },
        });

        return true;
    }

    private async moveToTrash(filePath: string): Promise<void> {
        const enableBackup = this.configService.get<boolean>('ARTIFACT_ENABLE_DEL_BACKUP') || false;
        const backupPath = this.configService.get<string>('ARTIFACT_DEL_BACKUP_PATH') || './storage/trash';

        try {
            if (enableBackup) {
                await fs.mkdir(backupPath, { recursive: true });
                const fileName = path.basename(filePath);
                const destPath = path.join(backupPath, fileName);
                await fs.rename(filePath, destPath);
                // Update mtime to now
                const now = new Date();
                await fs.utimes(destPath, now, now);
                this.logger.log(`Moved artifact to trash: ${destPath}`);
            } else {
                await fs.unlink(filePath);
                this.logger.log(`Permanently deleted artifact: ${filePath}`);
            }
        } catch (error) {
            this.logger.warn(`Failed to cleanup artifact file: ${error.message}`);
        }
    }

    private isDownloadable(type: RoomArtifactType): boolean {
        return [
            RoomArtifactType.MEETING_ANALYTICS,
            RoomArtifactType.MEETING_SUMMARY,
            RoomArtifactType.SPEECH_TRANSCRIPTION,
        ].includes(type);
    }

    private async sendWebhookNotification(
        eventName: string,
        roomSid: string,
        artifact: any,
        metadata: RoomArtifactMetadata,
        forceSend: boolean
    ): Promise<void> {
        const event = create(CommonNotifyEventSchema, {
            event: eventName,
            room: {
                sid: roomSid,
                roomId: artifact.roomId,
            },
            roomArtifact: {
                type: RoomArtifactType[artifact.type as keyof typeof RoomArtifactType] || RoomArtifactType.UNKNOWN_ARTIFACT,
                artifactId: artifact.artifactId,
                metadata: metadata,
            },
        });

        if (forceSend) {
            await this.webhookNotifier.forceToPutInQueue(event);
        } else {
            await this.webhookNotifier.sendWebhookEvent(event);
        }
    }
}
