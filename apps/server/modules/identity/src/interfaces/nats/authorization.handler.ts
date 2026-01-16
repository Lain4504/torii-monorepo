import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { IAuthorizationService } from '../../interfaces/services';
import { AUTHORIZATION_SERVICE_TOKEN } from '../../interfaces/services';
import { AuthorizationConfigService } from '../../modules/authorization/authorization-config.service';
import { AuthorizationSeederService } from '../../modules/authorization/authorization-seeder.service';

@Controller()
export class AuthorizationHandler {
    private readonly logger = new Logger(AuthorizationHandler.name);

    constructor(
        @Inject(AUTHORIZATION_SERVICE_TOKEN) private readonly authorizationService: IAuthorizationService,
        private readonly authorizationConfig: AuthorizationConfigService,
        private readonly seeder: AuthorizationSeederService,
    ) { }

    @MessagePattern({ cmd: 'identity.authz.getRoles' })
    async getRoles() {
        return this.authorizationConfig.getRoles();
    }

    @MessagePattern({ cmd: 'identity.authz.getPermissions' })
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
            all: permissions,
            byCategory: grouped,
        };
    }

    @MessagePattern({ cmd: 'identity.authz.getRolePermissions' })
    async getRolePermissions(@Payload() data: { roleCode: string }) {
        const permissions = await this.authorizationService.getRolePermissions(data.roleCode);
        return {
            roleCode: data.roleCode,
            permissions,
        };
    }

    @MessagePattern({ cmd: 'identity.authz.setRolePermissions' })
    async setRolePermissions(@Payload() data: { roleCode: string; permissions: string[] }) {
        this.logger.log(`Set permissions for role ${data.roleCode}`);
        await this.authorizationService.setRolePermissions(data.roleCode, data.permissions);
        return {
            roleCode: data.roleCode,
            permissions: data.permissions,
        };
    }

    @MessagePattern({ cmd: 'identity.authz.reseedPermissions' })
    async reseedPermissions() {
        return this.seeder.reseedNewPermissions();
    }
}
