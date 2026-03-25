import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    Req,
    UseGuards,
    ForbiddenException,
    Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    GatewayAuthGuard,
    Permissions,
    PermissionsGuard,
    ZodValidationPipe,
    successResponse,
    ReqWithRequester,
} from '@server/shared';
import {
    AcademyFolderCreateDTO,
    AcademyResourceCreateDTO,
    AcademyResourceUpdateDTO,
    academyFolderCreateDTOSchema,
    academyResourceCreateDTOSchema,
    academyResourceUpdateDTOSchema,
    StoragePresignedUrlRequestDTO,
    StorageConfirmUploadRequestDTO,
    storagePresignedUrlRequestDTOSchema,
    storageConfirmUploadRequestDTOSchema,
} from '@workspace/schemas';

@Controller('api/academy')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class AcademyResourceController {
    constructor(@Inject('NATS_SERVICE') private readonly nats: ClientProxy) { }

    // --- Learner APIs ---

    @Get('my-folders/live-classes')
    async getMyLiveClassFolders(
        @Req() req: ReqWithRequester,
        @Query('classId') classId?: string,
    ) {
        const folders = await firstValueFrom(
            this.nats.send(
                { cmd: 'academy.resource.getFoldersForLearner' },
                { userId: req.requester.sub, classId },
            ),
        );
        return successResponse(folders);
    }

    @Get('my-folders/live-classes/:classId/resources')
    async getMyLiveClassResources(
        @Param('classId', new ParseUUIDPipe()) classId: string,
        @Req() req: ReqWithRequester,
    ) {
        // Note: The service already checks enrollment if folderId is passed.
        // Here we might need to find the folderId first or change the handler to accept classId.
        // For simplicity, let's assume we use the handler that checks enrollment.
        // I'll update the service to have a specific method for this if needed, 
        // but the service I wrote already has getResourcesForLearner(folderId, userId).
        // Let's first get the folder for this class.

        // Actually, I'll add a command for this.
        const resources = await firstValueFrom(
            this.nats.send(
                { cmd: 'academy.resource.getResourcesForLearner' },
                { classId, userId: req.requester.sub },
            ),
        );
        return successResponse(resources);
    }

    @Get('resources/:resourceId')
    async getResourceDetail(
        @Param('resourceId', new ParseUUIDPipe()) resourceId: string,
        @Req() req: ReqWithRequester,
    ) {
        const resource = await firstValueFrom(
            this.nats.send(
                { cmd: 'academy.resource.getResourceDetail' },
                { id: resourceId, userId: req.requester.sub },
            ),
        );
        return successResponse(resource);
    }

    // --- Staff/Lecturer APIs ---

    @Post('resources')
    @Permissions('academy.delivery.write')
    @HttpCode(HttpStatus.CREATED)
    async createResource(
        @Body(new ZodValidationPipe(academyResourceCreateDTOSchema))
        dto: AcademyResourceCreateDTO,
        @Req() req: ReqWithRequester,
    ) {
        const item = await firstValueFrom(
            this.nats.send(
                { cmd: 'academy.resource.createResource' },
                { input: dto, creatorId: req.requester.sub },
            ),
        );
        return successResponse(item);
    }

    @Put('resources/:resourceId')
    @Permissions('academy.delivery.write')
    async updateResource(
        @Param('resourceId', new ParseUUIDPipe()) resourceId: string,
        @Body(new ZodValidationPipe(academyResourceUpdateDTOSchema))
        dto: AcademyResourceUpdateDTO,
        @Req() req: ReqWithRequester,
    ) {
        const item = await firstValueFrom(
            this.nats.send(
                { cmd: 'academy.resource.updateResource' },
                { id: resourceId, input: dto, userId: req.requester.sub },
            ),
        );
        return successResponse(item);
    }


    @Delete('resources/:resourceId')
    @Permissions('academy.delivery.write')
    async deleteResource(
        @Param('resourceId', new ParseUUIDPipe()) resourceId: string,
        @Req() req: ReqWithRequester,
    ) {
        const result = await firstValueFrom(
            this.nats.send(
                { cmd: 'academy.resource.deleteResource' },
                { id: resourceId, userId: req.requester.sub },
            ),
        );
        return successResponse(result);
    }


    @Get('folders/:folderId/resources')
    @Permissions('academy.delivery.read')
    async getResourcesByFolder(
        @Param('folderId', new ParseUUIDPipe()) folderId: string,
    ) {
        const resources = await firstValueFrom(
            this.nats.send(
                { cmd: 'academy.resource.getResourcesByFolder' },
                { folderId },
            ),
        );
        return successResponse(resources);
    }

    @Get('folders/:ownerType/:ownerId')
    @Permissions('academy.delivery.read')
    async getFoldersByOwner(
        @Param('ownerType') ownerType: string,
        @Param('ownerId', new ParseUUIDPipe()) ownerId: string,
    ) {
        const folders = await firstValueFrom(
            this.nats.send(
                { cmd: 'academy.resource.getFoldersByOwner' },
                { ownerType, ownerId },
            ),
        );
        return successResponse(folders);
    }

    @Post('folders')
    @Permissions('academy.delivery.write')
    async createFolder(
        @Body(new ZodValidationPipe(academyFolderCreateDTOSchema))
        dto: AcademyFolderCreateDTO,
    ) {
        const item = await firstValueFrom(
            this.nats.send({ cmd: 'academy.resource.createFolder' }, dto),
        );
        return successResponse(item);
    }
}
