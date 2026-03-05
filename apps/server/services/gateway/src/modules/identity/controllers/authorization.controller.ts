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
import {
  successResponse,
  errorResponse,
  GatewayAuthGuard,
  PermissionsGuard,
  Permissions,
} from '@server/shared';

@Controller('api/authorization')
@UseGuards(GatewayAuthGuard, PermissionsGuard)
export class AuthorizationController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  @Get('roles')
  async getRoles() {
    try {
      const result = await firstValueFrom(
        this.natsClient.send({ cmd: 'identity.authz.getRoles' }, {}),
      );
      return successResponse(result);
    } catch (error: unknown) {
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch roles',
      );
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
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch permissions',
      );
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
      return errorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to fetch role permissions',
      );
    }
  }

  @Put('roles/:roleCode/permissions')
  @Permissions('user.manage')
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
      return errorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to update role permissions',
      );
    }
  }

  @Post('reseed')
  @Permissions('user.manage')
  async reseedPermissions() {
    try {
      await firstValueFrom(
        this.natsClient.send({ cmd: 'identity.authz.reseedPermissions' }, {}),
      );
      return successResponse(null, 'Permissions reseeded successfully');
    } catch (error: unknown) {
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to reseed permissions',
      );
    }
  }
}
