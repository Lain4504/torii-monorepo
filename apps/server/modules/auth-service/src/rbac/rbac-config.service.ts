import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface RoleDefinition {
    code: string;
    name: string;
    description: string;
    extends?: string;  // Support role inheritance
}

export interface PermissionDefinition {
    code: string;
    description: string;
    category: string;
}

interface RBACConfig {
    system: {
        version: string;
        description: string;
    };
    roles: RoleDefinition[];
    permissions: PermissionDefinition[];
    default_role_permissions: Record<string, string[]>;
    staff_template_suggestions?: Record<string, string[]>;
}

@Injectable()
export class RBACConfigService {
    private readonly logger = new Logger(RBACConfigService.name);
    private config: RBACConfig;

    constructor() {
        this.loadConfig();
    }

    private loadConfig() {
        try {
            const configPath = path.join(process.cwd(), 'config', 'rbac-config.yaml');
            const fileContents = fs.readFileSync(configPath, 'utf8');
            this.config = yaml.load(fileContents) as RBACConfig;
            this.logger.log(`RBAC config loaded: v${this.config.system.version}`);
        } catch (error) {
            this.logger.error('Failed to load RBAC config:', error);
            throw new Error('Failed to load RBAC configuration');
        }
    }

    /**
     * Get all defined roles
     */
    getRoles(): RoleDefinition[] {
        return this.config.roles;
    }

    /**
     * Get role by code
     */
    getRoleByCode(code: string): RoleDefinition | undefined {
        return this.config.roles.find(r => r.code === code);
    }

    /**
     * Get all defined permissions
     */
    getPermissions(): PermissionDefinition[] {
        return this.config.permissions;
    }

    /**
     * Get default permissions for a role
     */
    getRolePermissions(roleCode: string): string[] {
        return this.config.default_role_permissions[roleCode] || [];
    }

    /**
     * Get staff template permissions (suggestions only)
     */
    getStaffTemplatePermissions(templateName: string): string[] {
        return this.config.staff_template_suggestions?.[templateName] || [];
    }

    /**
     * Get all staff templates (suggestions only)
     */
    getStaffTemplates(): Record<string, string[]> {
        return this.config.staff_template_suggestions || {};
    }

    /**
     * Check if a permission code exists
     */
    isValidPermission(permissionCode: string): boolean {
        if (permissionCode === '*') return true;
        return this.config.permissions.some(p => p.code === permissionCode);
    }

    /**
     * Check if a role code exists
     */
    isValidRole(roleCode: string): boolean {
        return this.config.roles.some(r => r.code === roleCode);
    }

    /**
     * Reload configuration (useful for hot-reload without restart)
     */
    reloadConfig() {
        this.loadConfig();
    }
}
