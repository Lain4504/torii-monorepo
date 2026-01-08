
import { Controller, Get, Put, Post, Param, Body, UseGuards, Logger, Inject } from '@nestjs/common';
import { GatewayAuthGuard } from '@server/shared';
import { UserRole } from '@workspace/schemas';
import type { IAuthorizationService } from '../interfaces/services';
import { AUTHORIZATION_SERVICE_TOKEN } from '../interfaces/services';
import { AuthorizationConfigService } from '../modules/authorization/authorization-config.service';
import { AuthorizationSeederService } from '../modules/authorization/authorization-seeder.service';

@Controller('authorization')
@UseGuards(GatewayAuthGuard)
export class AuthorizationController {
    private readonly logger = new Logger(AuthorizationController.name);

    constructor(
        @Inject(AUTHORIZATION_SERVICE_TOKEN) private readonly authorizationService: IAuthorizationService,
        private readonly authorizationConfig: AuthorizationConfigService,
        private readonly seeder: AuthorizationSeederService,
    ) { }

    @Get('roles')
    async getRoles() {
        const roles = this.authorizationConfig.getRoles();
        return {
            success: true,
            data: roles,
        };
    }

    @Get('permissions')
    async getPermissions() {
        const permissions = this.authorizationConfig.getPermissions();

        // Group by category
        const grouped = permissions.reduce((acc, perm) => {
            if (!acc[perm.category]) {
                acc[perm.category] = [];
            }
            acc[perm.category].push(perm);
            return acc;
        }, {} as Record<string, typeof permissions>);

        return {
            success: true,
            data: {
                all: permissions,
                byCategory: grouped,
            },
        };
    }

    @Get('roles/:roleCode/permissions')
    async getRolePermissions(@Param('roleCode') roleCode: string) {
        try {
            const permissions = await this.authorizationService.getRolePermissions(roleCode);

            return {
                success: true,
                data: {
                    roleCode,
                    permissions,
                },
            };
        } catch (error: unknown) {
            return {
                success: false,
                message: (error instanceof Error ? error.message : 'Unknown error'),
            };
        }
    }

    @Put('roles/:roleCode/permissions')
    async setRolePermissions(
        @Param('roleCode') roleCode: string,
        @Body() data: { permissions: string[] }
    ) {
        try {
            this.logger.log(`Set permissions for role ${roleCode}`);

            await this.authorizationService.setRolePermissions(roleCode, data.permissions);

            return {
                success: true,
                message: `Updated permissions for role ${roleCode}`,
                data: { roleCode, permissions: data.permissions },
            };
        } catch (error: unknown) {
            this.logger.error(`Error updating permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                success: false,
                message: (error instanceof Error ? error.message : 'Unknown error'),
            };
        }
    }

    @Post('reseed')
    async reseedPermissions() {
        try {
            const result = await this.seeder.reseedNewPermissions();
            return {
                success: true,
                message: 'Re-seeding complete',
                data: result,
            };
        } catch (error: unknown) {
            return {
                success: false,
                message: (error instanceof Error ? error.message : 'Unknown error'),
            };
        }
    }
}

