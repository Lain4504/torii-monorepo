import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/generated/client';
import { RoomArtifactType as PrismaRoomArtifactType } from '@prisma/generated/enums';
import { PrismaService } from '@server/shared';
import {
    ArtifactInfoResSchema,
    ArtifactInfoSchema,
    DeleteArtifactResSchema,
    FetchArtifactsReq,
    FetchArtifactsResSchema,
    FetchArtifactsResultSchema,
    GetArtifactDownloadTokenResSchema,
    PastRoomInfoSchema,
    RoomArtifactMetadata,
    RoomArtifactMetadataSchema,
    RoomArtifactType,
} from '@workspace/protocol';
import { create, fromJson } from '@bufbuild/protobuf';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class ArtifactService {
    private readonly logger = new Logger(ArtifactService.name);
    private readonly storagePath: string;
    private readonly tokenValiditySec: number;
    private readonly enableTrash: boolean;
    private readonly trashPath: string;
    private readonly apiKey: string;
    private readonly apiSecret: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) {
        this.storagePath = path.resolve(
            this.configService.get<string>('ARTIFACTS_STORAGE_PATH') ?? './artifacts',
        );
        this.tokenValiditySec = Number(
            this.configService.get('ARTIFACTS_TOKEN_VALIDITY_SECONDS') ?? 600,
        );
        const trashEnabledRaw = this.configService.get('ARTIFACTS_ENABLE_DELETE_BACKUP');
        this.enableTrash = trashEnabledRaw === undefined ? true : String(trashEnabledRaw) !== 'false';
        const configuredTrash = this.configService.get<string>('ARTIFACTS_DELETE_BACKUP_PATH');
        this.trashPath = path.resolve(configuredTrash ?? path.join(this.storagePath, 'trash'));
        this.apiKey = this.configService.get<string>('LIVEKIT_API_KEY') ?? 'devkey';
        this.apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET') ?? 'secret';
    }

    /**
     * Return map of room_table_id -> artifact_id for meeting analytics.
     * Mirrors Go: GetAnalyticByRoomTableId but batch for efficiency.
     */
    async getAnalyticsArtifactsByRoomTableIds(ids: number[]): Promise<Record<number, string>> {
        const result: Record<number, string> = {};
        if (!ids.length) return result;

        try {
            const rows = await this.prisma.roomArtifact.findMany({
                where: {
                    roomTableId: { in: ids },
                    type: PrismaRoomArtifactType.MEETING_ANALYTICS,
                },
                select: { roomTableId: true, artifactId: true },
            });

            rows.forEach((row) => {
                if (row.roomTableId && row.artifactId) {
                    result[row.roomTableId] = row.artifactId;
                }
            });
        } catch (e: any) {
            this.logger.warn(`Failed to load analytics artifacts: ${e.message}`);
        }

        return result;
    }

    async fetchArtifacts(data: FetchArtifactsReq) {
        const from = Number(data.from || 0);
        let limit = Number(data.limit || 20);
        if (limit > 100) limit = 100;
        const orderBy = data.orderBy?.toUpperCase() === 'ASC' ? 'asc' : 'desc';

        const where: Prisma.RoomArtifactWhereInput = {};

        if (data.roomSid) {
            const room = await this.prisma.roomInfo.findUnique({ where: { sid: data.roomSid } });
            if (!room) {
                return create(FetchArtifactsResSchema, { status: false, msg: `room not found with sid: ${data.roomSid}` });
            }
            where.roomTableId = room.id;
        } else if (data.roomIds && data.roomIds.length) {
            where.roomId = { in: data.roomIds };
        }

        const prismaType = this.protoTypeToPrisma(data.type);
        if (prismaType) {
            where.type = prismaType;
        }

        const [totalArtifacts, rows] = await Promise.all([
            this.prisma.roomArtifact.count({ where }),
            this.prisma.roomArtifact.findMany({
                where,
                skip: from,
                take: limit,
                orderBy: { id: orderBy },
            }),
        ]);

        if (!totalArtifacts) {
            return create(FetchArtifactsResSchema, { status: false, msg: 'no artifacts found' });
        }

        const artifactsList = rows
            .map((row) => {
                const metadata = this.parseMetadata(row.metadata);
                if (!metadata) return null;

                return create(ArtifactInfoSchema, {
                    artifactId: row.artifactId,
                    roomId: row.roomId,
                    type: this.prismaTypeToProto(row.type),
                    created: (row as any).created?.toISOString?.() ?? '',
                    metadata,
                });
            })
            .filter(Boolean) as any[];

        const result = create(FetchArtifactsResultSchema, {
            totalArtifacts: String(totalArtifacts),
            from: String(from),
            limit: String(limit),
            orderBy: orderBy.toUpperCase(),
            type: data.type,
            artifactsList,
        });

        return create(FetchArtifactsResSchema, { status: true, msg: 'success', result });
    }

    async getArtifactInfo(artifactId: string) {
        const row = await this.prisma.roomArtifact.findUnique({
            where: { artifactId },
            include: { roomInfo: true },
        });

        if (!row) {
            return create(ArtifactInfoResSchema, { status: false, msg: `artifact not found with ID: ${artifactId}` });
        }

        const metadata = this.parseMetadata(row.metadata);
        if (!metadata) {
            return create(ArtifactInfoResSchema, { status: false, msg: 'invalid artifact metadata' });
        }

        const artifactInfo = create(ArtifactInfoSchema, {
            artifactId: row.artifactId,
            roomId: row.roomId,
            type: this.prismaTypeToProto(row.type),
            created: (row as any).created?.toISOString?.() ?? '',
            metadata,
        });

        const roomInfo = row.roomInfo
            ? create(PastRoomInfoSchema, {
                roomTitle: row.roomInfo.roomTitle,
                roomId: row.roomInfo.roomId,
                roomSid: row.roomInfo.sid,
                joinedParticipants: String(row.roomInfo.joinedParticipants ?? 0),
                webhookUrl: row.roomInfo.webhookUrl || '',
                created: (row.roomInfo as any).created?.toISOString?.() ?? '',
                ended: (row.roomInfo as any).ended?.toISOString?.() ?? '',
            })
            : undefined;

        return create(ArtifactInfoResSchema, {
            status: true,
            msg: 'success',
            artifactInfo,
            roomInfo,
        });
    }

    async getDownloadToken(artifactId: string) {
        const artifact = await this.prisma.roomArtifact.findUnique({ where: { artifactId } });
        if (!artifact) {
            return create(GetArtifactDownloadTokenResSchema, { status: false, msg: `artifact not found with ID: ${artifactId}` });
        }

        const protoType = this.prismaTypeToProto(artifact.type);
        if (!this.isDownloadable(protoType)) {
            return create(GetArtifactDownloadTokenResSchema, {
                status: false,
                msg: `'${artifact.type}' artifact type is not downloadable`,
            });
        }

        const metadata = this.parseMetadata(artifact.metadata);
        if (!metadata?.fileInfo?.filePath) {
            return create(GetArtifactDownloadTokenResSchema, {
                status: false,
                msg: 'artifact has no downloadable file',
            });
        }

        const now = Math.floor(Date.now() / 1000);
        const token = jwt.sign(
            {
                iss: this.apiKey,
                sub: metadata.fileInfo.filePath,
                nbf: now,
                exp: now + this.tokenValiditySec,
            },
            this.apiSecret,
            { algorithm: 'HS256', header: { typ: 'JWT' } },
        );

        return create(GetArtifactDownloadTokenResSchema, { status: true, msg: 'success', token });
    }

    async verifyDownloadToken(token: string) {
        try {
            const payload = jwt.verify(token, this.apiSecret, {
                algorithms: ['HS256'],
                issuer: this.apiKey,
            }) as jwt.JwtPayload;

            const relativePath = payload.sub as string;
            if (!relativePath) throw new Error('invalid token: file path not found');

            const absolutePath = this.buildAbsolutePath(relativePath);
            const stats = await fs.lstat(absolutePath);
            return { absolutePath, fileName: path.basename(absolutePath), size: stats.size };
        } catch (err: any) {
            throw new Error(err?.message || 'invalid token');
        }
    }

    async deleteArtifact(artifactId: string) {
        const artifact = await this.prisma.roomArtifact.findUnique({ where: { artifactId } });
        if (!artifact) {
            return create(DeleteArtifactResSchema, { status: false, msg: `artifact not found with ID: ${artifactId}` });
        }

        const protoType = this.prismaTypeToProto(artifact.type);
        if (!this.isDeletable(protoType)) {
            return create(DeleteArtifactResSchema, {
                status: false,
                msg: `deleting '${artifact.type}' artifact type is not allowed`,
            });
        }

        const metadata = this.parseMetadata(artifact.metadata);
        const relativePath = metadata?.fileInfo?.filePath;
        if (relativePath) {
            const absolutePath = this.buildAbsolutePath(relativePath);
            await this.deleteOrBackupFile(absolutePath);
        }

        try {
            await this.prisma.roomArtifact.delete({ where: { artifactId } });
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError) {
                this.logger.warn(`Failed to delete artifact ${artifactId}: ${err.message}`);
            } else {
                throw err;
            }
        }

        return create(DeleteArtifactResSchema, { status: true, msg: 'success' });
    }

    private parseMetadata(raw: Prisma.JsonValue | null): RoomArtifactMetadata | undefined {
        if (!raw) return undefined;
        try {
            const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
            return fromJson(RoomArtifactMetadataSchema, obj as any, { ignoreUnknownFields: true });
        } catch (err: any) {
            this.logger.warn(`Failed to parse artifact metadata: ${err.message}`);
            return undefined;
        }
    }

    private prismaTypeToProto(type: PrismaRoomArtifactType | string): RoomArtifactType {
        const key = typeof type === 'string' ? type : String(type);
        return (RoomArtifactType as any)[key] ?? RoomArtifactType.UNKNOWN_ARTIFACT;
    }

    private protoTypeToPrisma(type?: RoomArtifactType | null): PrismaRoomArtifactType | undefined {
        if (type === undefined || type === null) return undefined;
        const key = RoomArtifactType[type];
        if (!key) return undefined;
        return key as unknown as PrismaRoomArtifactType;
    }

    private isDownloadable(type: RoomArtifactType): boolean {
        return [
            RoomArtifactType.MEETING_ANALYTICS,
            RoomArtifactType.MEETING_SUMMARY,
            RoomArtifactType.SPEECH_TRANSCRIPTION,
        ].includes(type);
    }

    private isDeletable(type: RoomArtifactType): boolean {
        return [
            RoomArtifactType.MEETING_ANALYTICS,
            RoomArtifactType.MEETING_SUMMARY,
            RoomArtifactType.SPEECH_TRANSCRIPTION,
        ].includes(type);
    }

    private buildAbsolutePath(relativePath: string) {
        return path.resolve(this.storagePath, relativePath);
    }

    private async ensureDir(dir: string) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch { /* ignore */ }
    }

    private async deleteOrBackupFile(filePath: string) {
        try {
            if (this.enableTrash) {
                await this.ensureDir(this.trashPath);
                const dest = path.join(this.trashPath, path.basename(filePath));
                await fs.rename(filePath, dest);
                const now = new Date();
                await fs.utimes(dest, now, now);
            } else {
                await fs.unlink(filePath);
            }
        } catch (err: any) {
            this.logger.warn(`Failed to handle artifact file deletion: ${err.message}`);
        }
    }
}
