import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
    AcademyFolderCreateDTO,
    AcademyFolderUpdateDTO,
    AcademyResourceCreateDTO,
    AcademyResourceUpdateDTO,
    AcademyFolderResponseDTO,
    AcademyResourceResponseDTO,
    AcademyFolderOwnerType
} from '@workspace/schemas';
import { AuditLoggerService } from '../audit-logger.service';
import { STORAGE_SERVICE_TOKEN, IStorageService } from '@server/academy/interfaces/services/i-storage.service';



@Injectable()
export class ResourceService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLoggerService,
        @Inject(STORAGE_SERVICE_TOKEN)
        private readonly storageService: IStorageService,
    ) { }



    // --- Folder Management ---

    async createFolder(data: AcademyFolderCreateDTO) {
        return this.prisma.academyFolder.create({
            data: {
                name: data.name,
                type: data.type as any,
                liveClassId: String(data.ownerType) === 'LIVE_CLASS' ? data.ownerId : data.liveClassId,
                ownerType: data.ownerType as any,
            },
        });
    }

    async getFoldersForLearner(userId: string, classId?: string) {
        // Get active/completed enrollments
        const enrollments = await this.prisma.enrollment.findMany({
            where: {
                userId,
                status: { in: ['ACTIVE', 'COMPLETED'] },
                liveClassId: classId || { not: null },
            },
            select: { liveClassId: true },
        });

        const liveClassIds = enrollments.map((e) => e.liveClassId as string);

        const folders = await this.prisma.academyFolder.findMany({
            where: {
                liveClassId: { in: liveClassIds },
                ownerType: 'LIVE_CLASS',
            },
            include: {
                liveClass: {
                    select: { id: true, name: true, code: true },
                },
                _count: {
                    select: { resources: { where: { status: 'ACTIVE' } } },
                },
            },
        });

        return folders.map((f): AcademyFolderResponseDTO => ({
            folderId: f.id,
            folderName: f.name,
            type: f.type,
            liveClass: f.liveClass ? {
                id: f.liveClass.id,
                name: f.liveClass.name,
                code: f.liveClass.code,
            } : undefined,
            resourceCount: (f as any)._count.resources,
        }));
    }

    async getFoldersByOwner(ownerId: string, ownerType: string) {
        const folders = await this.prisma.academyFolder.findMany({
            where: {
                liveClassId: ownerType === 'LIVE_CLASS' ? ownerId : undefined,
                ownerType: ownerType as any,
            },
            include: {
                _count: {
                    select: { resources: true },
                },
            },
        });

        return folders.map((f): AcademyFolderResponseDTO => ({
            folderId: f.id,
            folderName: f.name,
            type: f.type,
            resourceCount: (f as any)._count.resources,
        }));
    }

    async getFolderById(id: string) {
        const folder = await this.prisma.academyFolder.findUnique({
            where: { id },
            include: { liveClass: true },
        });
        if (!folder) throw new NotFoundException('Folder not found');
        return folder;
    }

    // --- Resource Management ---

    async createResource(data: AcademyResourceCreateDTO, creatorId: string) {
        const resource = await this.prisma.academyResource.create({
            data: {
                folderId: data.folderId,
                fileAssetId: data.fileAssetId,
                externalUrl: data.externalUrl,
                title: data.title,
                description: data.description,
                resourceType: data.resourceType as any,
                visibility: data.visibility as any,
                sortOrder: data.sortOrder,
                createdBy: creatorId,
            },
        });

        await this.audit.log({
            userId: creatorId,
            action: 'CREATE_RESOURCE',
            entity: 'AcademyResource',
            entityId: resource.id,
            description: `Created resource: ${resource.title}`,
            newValues: resource,
        });

        return resource;
    }


    async getResourcesForLearner(data: { folderId?: string; classId?: string; userId: string }) {
        let folderId = data.folderId;

        if (!folderId && data.classId) {
            const folder = await this.prisma.academyFolder.findFirst({
                where: { liveClassId: data.classId },
            });
            if (!folder) return [];
            folderId = folder.id;
        }

        if (!folderId) throw new BadRequestException('Folder or Class ID is required');

        const folder = await this.getFolderById(folderId);

        // Check enrollment if folder is linked to a live class
        if (folder.liveClassId) {
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    userId: data.userId,
                    liveClassId: folder.liveClassId,
                    status: { in: ['ACTIVE', 'COMPLETED'] },
                },
            });
            if (!enrollment) {
                throw new ForbiddenException('You are not enrolled in this class');
            }
        }

        const resources = await this.prisma.academyResource.findMany({
            where: {
                folderId,
                status: 'ACTIVE',
                visibility: 'PUBLIC',
            },
            include: {
                fileAsset: true,
            },
            orderBy: { sortOrder: 'asc' },
        });

        const items = await Promise.all(resources.map(async (r): Promise<AcademyResourceResponseDTO> => {
            let downloadUrl = r.fileAsset?.fileUrl;

            // SPEC: Use signed URL for private files
            if (r.resourceType === 'FILE' && r.fileAssetId) {
                try {
                    const signed = await this.storageService.getSignedUrl({
                        fileId: r.fileAssetId,
                        expiresIn: 3600,
                    });
                    downloadUrl = signed.signedUrl;
                } catch (e) {
                    // Fallback to public URL if signed URL fails
                }
            }

            return {
                id: r.id,
                folderId: r.folderId,
                fileAssetId: r.fileAssetId || undefined,
                externalUrl: r.externalUrl || undefined,
                title: r.title,
                description: r.description || undefined,
                resourceType: r.resourceType,
                visibility: r.visibility,
                status: r.status,
                sortOrder: r.sortOrder,
                downloadUrl,
            };
        }));

        return items;
    }


    async getResourcesByClassId(classId: string, userId: string) {
        const folder = await this.prisma.academyFolder.findFirst({
            where: { liveClassId: classId },
        });
        if (!folder) return [];
        return this.getResourcesForLearner({ folderId: folder.id, userId });
    }

    async getResourcesByFolderId(folderId: string) {
        const resources = await this.prisma.academyResource.findMany({
            where: {
                folderId,
                status: 'ACTIVE',
            },
            include: {
                fileAsset: true,
            },
            orderBy: { sortOrder: 'asc' },
        });

        return resources.map((r): AcademyResourceResponseDTO => ({
            id: r.id,
            folderId: r.folderId,
            fileAssetId: r.fileAssetId || undefined,
            externalUrl: r.externalUrl || undefined,
            title: r.title,
            description: r.description || undefined,
            resourceType: r.resourceType,
            visibility: r.visibility,
            status: r.status,
            sortOrder: r.sortOrder,
            downloadUrl: r.fileAsset?.fileUrl,
        }));
    }

    async updateResource(id: string, data: AcademyResourceUpdateDTO, userId: string) {
        const oldResource = await this.prisma.academyResource.findUnique({ where: { id } });
        if (!oldResource) throw new NotFoundException('Resource not found');

        const resource = await this.prisma.academyResource.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                visibility: data.visibility as any,
                status: data.status,
                sortOrder: data.sortOrder,
            },
        });

        await this.audit.log({
            userId,
            action: 'UPDATE_RESOURCE',
            entity: 'AcademyResource',
            entityId: id,
            description: `Updated resource: ${resource.title}`,
            oldValues: oldResource,
            newValues: resource,
        });

        return resource;
    }


    async deleteResource(id: string, userId: string) {
        const resource = await this.prisma.academyResource.update({
            where: { id },
            data: { status: 'ARCHIVED' },
        });

        await this.audit.log({
            userId,
            action: 'DELETE_RESOURCE',
            entity: 'AcademyResource',
            entityId: id,
            description: `Archived (deleted) resource: ${resource.title}`,
            newValues: { status: 'ARCHIVED' },
        });

        return resource;
    }


    async getResourceDetail(id: string, userId: string): Promise<AcademyResourceResponseDTO> {
        const resource = await this.prisma.academyResource.findUnique({
            where: { id },
            include: {
                folder: true,
                fileAsset: true,
            },
        });

        if (!resource) throw new NotFoundException('Resource not found');

        // Check enrollment if folder is linked to a live class
        if (resource.folder.liveClassId) {
            const enrollment = await this.prisma.enrollment.findFirst({
                where: {
                    userId,
                    liveClassId: resource.folder.liveClassId,
                    status: { in: ['ACTIVE', 'COMPLETED'] },
                },
            });
            if (!enrollment) {
                throw new ForbiddenException('You are not enrolled in this class');
            }
        }

        // SPEC: Resource must be PUBLIC for learners
        if (resource.visibility !== 'PUBLIC') {
            throw new ForbiddenException('This resource is hidden');
        }

        let downloadUrl = resource.fileAsset?.fileUrl;

        // SPEC: Use signed URL for private files
        if (resource.resourceType === 'FILE' && resource.fileAssetId) {
            try {
                const signed = await this.storageService.getSignedUrl({
                    fileId: resource.fileAssetId,
                    expiresIn: 3600,
                });
                downloadUrl = signed.signedUrl;
            } catch (e) {
                // Fallback
            }
        }

        return {
            id: resource.id,
            folderId: resource.folderId,
            fileAssetId: resource.fileAssetId || undefined,
            externalUrl: resource.externalUrl || undefined,
            title: resource.title,
            description: resource.description || undefined,
            resourceType: resource.resourceType as any,
            visibility: resource.visibility as any,
            status: resource.status,
            sortOrder: resource.sortOrder,
            downloadUrl,
        };
    }

}
