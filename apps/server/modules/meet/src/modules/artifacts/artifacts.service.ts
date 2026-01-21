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
    PastRoomInfoSchema,
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
        // Convert enum to string for directory name (e.g. MEETING_ANALYTICS -> meeting_analytics)
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

    /**
     * fetchArtifacts retrieves a paginated list of artifacts
     */
    async fetchArtifacts(req: FetchArtifactsReq): Promise<FetchArtifactsResult> {
        const limit = Math.min(Math.max(Number(req.limit) || 20, 1), 100);
        const from = Number(req.from) || 0;
        const orderBy = req.orderBy === 'ASC' ? 'asc' : 'desc';

        const where: any = {};
        if (req.roomIds && req.roomIds.length > 0) {
            where.roomId = { in: req.roomIds };
        }
        if (req.roomSid) {
            where.roomInfo = { sid: req.roomSid };
        }
        if (req.type !== undefined && req.type !== RoomArtifactType.UNKNOWN_ARTIFACT) {
            where.type = RoomArtifactType[req.type];
        }

        const [artifacts, total] = await Promise.all([
            this.prisma.roomArtifact.findMany({
                where,
                skip: from,
                take: limit,
                orderBy: { created: orderBy },
                include: { roomInfo: true }
            }),
            this.prisma.roomArtifact.count({ where })
        ]);

        const artifactsList = artifacts.map(a => {
            const metadata = fromJson(RoomArtifactMetadataSchema, a.metadata as any);
            return create(ArtifactInfoSchema, {
                artifactId: a.artifactId,
                roomId: a.roomId,
                type: RoomArtifactType[a.type as keyof typeof RoomArtifactType] || RoomArtifactType.UNKNOWN_ARTIFACT,
                created: a.created.toISOString(),
                metadata: metadata,
            });
        });

        return create(FetchArtifactsResultSchema, {
            totalArtifacts: total.toString(),
            from: from.toString(),
            limit: limit.toString(),
            orderBy: req.orderBy,
            type: req.type,
            artifactsList: artifactsList,
        });
    }

    /**
     * getArtifactInfoByArtifactId retrieves detailed artifact info
     */
    async getArtifactInfoByArtifactId(artifactId: string): Promise<ArtifactInfoRes> {
        const artifact = await this.prisma.roomArtifact.findUnique({
            where: { artifactId },
            include: { roomInfo: true }
        });

        if (!artifact) {
            throw new Error(`artifact not found with ID: ${artifactId}`);
        }

        const metadata = fromJson(RoomArtifactMetadataSchema, artifact.metadata as any);
        const artifactInfo = create(ArtifactInfoSchema, {
            artifactId: artifact.artifactId,
            roomId: artifact.roomId,
            type: RoomArtifactType[artifact.type as keyof typeof RoomArtifactType] || RoomArtifactType.UNKNOWN_ARTIFACT,
            created: artifact.created.toISOString(),
            metadata: metadata,
        });

        const res = create(ArtifactInfoResSchema, {
            status: true,
            msg: 'success',
            artifactInfo: artifactInfo,
        });

        if (artifact.roomInfo) {
            res.roomInfo = create(PastRoomInfoSchema, {
                roomTitle: artifact.roomInfo.roomTitle,
                roomId: artifact.roomInfo.roomId,
                roomSid: artifact.roomInfo.sid,
                joinedParticipants: artifact.roomInfo.joinedParticipants.toString(),
                webhookUrl: artifact.roomInfo.webhookUrl,
                created: artifact.roomInfo.created.toISOString(),
                ended: artifact.roomInfo.ended?.toISOString() || '',
            });
        }

        return res;
    }

    /**
     * getArtifactDownloadToken generates a JWT for secure file downloads
     */
    async getArtifactDownloadToken(artifactId: string): Promise<string> {
        const artifact = await this.prisma.roomArtifact.findUnique({
            where: { artifactId },
        });

        if (!artifact) {
            throw new Error(`artifact not found with ID: ${artifactId}`);
        }

        const type = RoomArtifactType[artifact.type as keyof typeof RoomArtifactType] || RoomArtifactType.UNKNOWN_ARTIFACT;
        if (!this.isDownloadable(type)) {
            throw new Error(`'${artifact.type}' artifact type is not downloadable`);
        }

        const metadata = fromJson(RoomArtifactMetadataSchema, artifact.metadata as any);
        if (!metadata.fileInfo || !metadata.fileInfo.filePath) {
            throw new Error('artifact has no downloadable file');
        }

        return generateTokenForDownloadRecording(
            metadata.fileInfo.filePath,
            this.apiKey,
            this.apiSecret,
            this.tokenValidity
        );
    }

    /**
     * verifyArtifactDownloadJWT validates download tokens
     */
    async verifyArtifactDownloadJWT(token: string): Promise<{ absolutePath: string; fileName: string }> {
        try {
            const decoded = jwt.verify(token, this.apiSecret, {
                algorithms: ['HS256'],
                issuer: this.apiKey,
            }) as any;

            const relativePath = decoded.sub;
            if (!relativePath) {
                throw new Error('invalid token: file path not found');
            }

            const absolutePath = path.join(this.storagePath, 'artifacts', relativePath);
            try {
                const stats = await fs.stat(absolutePath);
                if (!stats.isFile()) {
                    throw new Error('target is not a file');
                }
                return {
                    absolutePath,
                    fileName: path.basename(absolutePath),
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

        // Logic for moving to trash or permanent deletion
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
