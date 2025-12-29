import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface RBACConfig {
    system: { version: string; description: string };
    roles: Array<{ code: string; name: string; description: string }>;
    permissions: Array<{ code: string; description: string; category: string }>;
    default_role_permissions: Record<string, string[]>;
    staff_template_suggestions?: Record<string, string[]>;
}

@Injectable()
export class RBACSeederService implements OnModuleInit {
    private readonly logger = new Logger(RBACSeederService.name);

    constructor(private readonly prisma: PrismaService) { }

    async onModuleInit() {
        await this.seedIfNeeded();
    }

    private loadYAML(): RBACConfig {
        try {
            const configPath = path.join(process.cwd(), 'config', 'rbac-config.yaml');
            const fileContents = fs.readFileSync(configPath, 'utf8');
            return yaml.load(fileContents) as RBACConfig;
        } catch (error) {
            this.logger.error('Failed to load RBAC config:', error);
            throw new Error('Failed to load RBAC configuration');
        }
    }

    /**
     * Resolve role inheritance - flatten permissions for roles that extend others
     * Example: staff-lms extends staff → gets staff permissions + its own
     */
    private resolveInheritance(config: RBACConfig): Record<string, string[]> {
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
     * Seed RBAC data if database is empty
     * Runs ONCE on first startup only
     */
    async seedIfNeeded() {
        try {
            // Check if already seeded
            const existingPerms = await this.prisma.rolePermission.count();
            if (existingPerms > 0) {
                this.logger.log(`RBAC already seeded (${existingPerms} permissions found), skipping...`);
                return;
            }

            this.logger.log('🌱 Seeding RBAC from YAML config...');
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

            this.logger.log(`🎉 RBAC seeding complete! Total: ${seededCount} role-permission mappings`);
        } catch (error) {
            this.logger.error('❌ RBAC seeding failed:', error);
            throw error;
        }
    }

    /**
     * Manual re-seed for when new permissions are added to YAML
     * Only adds NEW permissions that don't exist yet
     * Call this via admin API when permissions are added
     */
    async reseedNewPermissions() {
        try {
            this.logger.log('🔄 Re-seeding new permissions from YAML...');
            const config = this.loadYAML();

            let addedCount = 0;
            for (const [roleCode, permissions] of Object.entries(config.default_role_permissions)) {
                for (const permCode of permissions) {
                    if (permCode === '*') continue;

                    // Upsert - only create if doesn't exist
                    const result = await this.prisma.rolePermission.upsert({
                        where: {
                            roleCode_permissionCode: {
                                roleCode,
                                permissionCode: permCode,
                            },
                        },
                        create: {
                            roleCode,
                            permissionCode: permCode,
                        },
                        update: {}, // Don't override existing
                    });

                    if (result) addedCount++;
                }
            }

            this.logger.log(`✅ Re-seed complete! Added ${addedCount} new permission mappings`);
            return { success: true, addedCount };
        } catch (error) {
            this.logger.error('❌ Re-seed failed:', error);
            throw error;
        }
    }
}
