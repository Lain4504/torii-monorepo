import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface AuthorizationConfig {
    system: { version: string; description: string };
    roles: Array<{ code: string; name: string; description: string }>;
    permissions: Array<{ code: string; description: string; category: string }>;
    default_role_permissions: Record<string, string[]>;
    staff_template_suggestions?: Record<string, string[]>;
}

@Injectable()
export class AuthorizationSeederService implements OnModuleInit {
    private readonly logger = new Logger(AuthorizationSeederService.name);

    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit() {
        await this.seedIfNeeded();
        // Force update permissions from YAML when app starts to sync changes
        await this.syncPermissionsFromConfig();
    }

    private loadYAML(): AuthorizationConfig {
        try {
            const configPath = path.join(process.cwd(), 'config', 'rbac-config.yaml');
            const fileContents = fs.readFileSync(configPath, 'utf8');
            return yaml.load(fileContents) as AuthorizationConfig;
        } catch (error) {
            this.logger.error('Failed to load authorization config:', error);
            throw new Error('Failed to load authorization configuration');
        }
    }

    /**
     * Resolve role inheritance - flatten permissions for roles that extend others
     * Example: staff-lms extends staff → gets staff permissions + its own
     */
    private resolveInheritance(config: AuthorizationConfig): Record<string, string[]> {
        const resolved: Record<string, string[]> = {};

        // Helper to get role by code
        const getRoleByCode = (code: string) => config.roles.find(r => r.code === code);

        // Recursively resolve permissions
        const resolvePerms = (roleCode: string, visited = new Set<string>()): string[] => {
            // Prevent circular dependencies
            if (visited.has(roleCode)) {
                this.logger.warn(`Circular inheritance detected for role: ${roleCode}`);
                return [];
            }
            visited.add(roleCode);

            const role = getRoleByCode(roleCode);
            if (!role) return [];

            let permissions: string[] = config.default_role_permissions[roleCode] || [];

            // If role extends another, inherit base permissions
            if ('extends' in role && role.extends) {
                const basePerms = resolvePerms(role.extends as string, visited);
                permissions = [...basePerms, ...permissions];
            }

            return permissions;
        };

        // Resolve all roles
        for (const roleCode of Object.keys(config.default_role_permissions)) {
            resolved[roleCode] = resolvePerms(roleCode);
        }

        return resolved;
    }

    /**
     * Seed authorization data if database is empty
     * Runs ONCE on first startup only
     */
    async seedIfNeeded() {
        try {
            // Check if already seeded
            const existingPerms = await this.prisma.rolePermission.count();
            if (existingPerms > 0) {
                this.logger.log(`Authorization already seeded (${existingPerms} permissions found), skipping...`);
                return;
            }

            this.logger.log('🌱 Seeding authorization from YAML config...');
            const config = this.loadYAML();

            // Resolve inheritance to get final permission sets
            const resolvedPerms = this.resolveInheritance(config);

            // Seed default role_permissions
            let seededCount = 0;
            for (const [roleCode, permissions] of Object.entries(resolvedPerms)) {
                // Remove duplicates
                const uniquePerms = Array.from(new Set(permissions));

                for (const permCode of uniquePerms) {
                    // Skip wildcard - handled separately in permission checking
                    if (permCode === '*') {
                        this.logger.log(`  ✅ Skipping wildcard for ${roleCode}`);
                        continue;
                    }

                    await this.prisma.rolePermission.create({
                        data: {
                            roleCode,
                            permissionCode: permCode,
                        },
                    });
                    seededCount++;
                }
                this.logger.log(`  ✅ Seeded ${uniquePerms.filter(p => p !== '*').length} permissions for ${roleCode}`);
            }

            this.logger.log(`🎉 Authorization seeding complete! Total: ${seededCount} role-permission mappings`);
        } catch (error) {
            this.logger.error('❌ Authorization seeding failed:', error);
            throw error;
        }
    }

    /**
     * Sync permissions from YAML to Database
     * Ensures DB has all permissions defined in YAML
     */
    async syncPermissionsFromConfig() {
        try {
            this.logger.log('🔄 Syncing permissions from YAML to Database...');
            const config = this.loadYAML();
            const resolvedPerms = this.resolveInheritance(config);

            let addedCount = 0;
            for (const [roleCode, permissions] of Object.entries(resolvedPerms)) {

                // Add new permissions
                const uniquePerms = Array.from(new Set(permissions));
                for (const permCode of uniquePerms) {
                    if (permCode === '*') continue;

                    // Upsert to ensure it exists
                    // We use createMany with skipDuplicates usually, but here we 
                    // want specific role checks. Using upsert for safety.
                    const existing = await this.prisma.rolePermission.findUnique({
                        where: {
                            roleCode_permissionCode: {
                                roleCode,
                                permissionCode: permCode
                            }
                        }
                    });

                    if (!existing) {
                        await this.prisma.rolePermission.create({
                            data: { roleCode, permissionCode: permCode }
                        });
                        addedCount++;
                    }
                }
            }

            if (addedCount > 0) {
                this.logger.log(`✅ Sync complete! Added ${addedCount} missing permissions.`);
            } else {
                this.logger.log('✅ Permissions are up to date.');
            }

        } catch (error) {
            this.logger.error('❌ Permission sync failed:', error);
        }
    }

    /**
     * Manual re-seed for when new permissions are added to YAML
     * Only adds NEW permissions that don't exist yet
     * Call this via admin API when permissions are added
     */
    async reseedNewPermissions() {
        return this.syncPermissionsFromConfig();
    }
}

export const trigger = 'reseed_r2';
