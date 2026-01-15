import {
    Controller,
    Get,
    Put,
    Post,
    Param,
    Body,
    UseGuards,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { successResponse, errorResponse } from '@server/shared';
import { IdentityAuthGuard } from '../guards/identity-auth.guard';

@Controller('api/authorization')
@UseGuards(IdentityAuthGuard)
export class AuthorizationController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Get('roles')
    async getRoles() {
        try {
            const result = await firstValueFrom(this.natsClient.send({ cmd: 'identity.authz.getRoles' }, {}));
            return successResponse(result);
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch roles');
        }
    }

    @Get('permissions')
    async getPermissions() {
        try {
            const result = await firstValueFrom(
                this.natsClient.send({ cmd: 'identity.authz.getPermissions' }, {}),
            );
            return successResponse(result);
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch permissions');
        }
    }

    @Get('roles/:roleCode/permissions')
    async getRolePermissions(@Param('roleCode') roleCode: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.authz.getRolePermissions' },
                    { roleCode },
                ),
            );
            return successResponse(result);
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to fetch role permissions');
        }
    }

    @Put('roles/:roleCode/permissions')
    async setRolePermissions(
        @Param('roleCode') roleCode: string,
        @Body() data: { permissions: string[] },
    ) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'identity.authz.setRolePermissions' },
                    { roleCode, permissions: data.permissions },
                ),
            );
            return successResponse(result, 'Role permissions updated successfully');
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to update role permissions');
        }
    }

    @Post('reseed')
    async reseedPermissions() {
        try {
            await firstValueFrom(
                this.natsClient.send({ cmd: 'identity.authz.reseedPermissions' }, {}),
            );
            return successResponse(null, 'Permissions reseeded successfully');
        } catch (error: unknown) {
            return errorResponse(error instanceof Error ? error.message : 'Failed to reseed permissions');
        }
    }
}
