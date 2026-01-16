import { Injectable, Logger, OnModuleInit, Inject } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import * as argon2 from 'argon2';

/**
 * Service to create default admin user on first application startup
 * This ensures there's always an admin account available for initial access
 */
@Injectable()
export class DefaultAdminService implements OnModuleInit {
    private readonly logger = new Logger(DefaultAdminService.name);

    constructor(
        private readonly prisma: PrismaService,
    ) { }

    /**
     * Called when the module is initialized
     * Checks and creates default admin if needed
     */
    async onModuleInit() {
        await this.ensureDefaultAdmin();
    }

    /**
     * Ensures a default admin user exists
     * Only creates if no users exist in the database
     */
    private async ensureDefaultAdmin(): Promise<void> {
        try {
            // Check if any users exist
            const userCount = await this.prisma.user.count();

            if (userCount > 0) {
                this.logger.log('✅ Users already exist. Skipping default admin creation.');
                return;
            }

            // Get default admin credentials from environment variables
            const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@torii.com';
            const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
            const adminDisplayName = process.env.DEFAULT_ADMIN_DISPLAY_NAME || 'System Administrator';

            // Hash the password
            const hashedPassword = await argon2.hash(adminPassword);

            // Create the default admin user
            const admin = await this.prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    displayName: adminDisplayName,
                    role: 'admin',
                    verifiedAt: new Date(), // Mark as verified
                },
            });

            this.logger.log('🎉 Default admin user created successfully!');
            this.logger.log(`   📧 Email: ${adminEmail}`);
            this.logger.log(`   🔑 Password: ${adminPassword}`);
            this.logger.log(`   👤 Role: ADMIN`);
            this.logger.warn('⚠️  IMPORTANT: Please change the default password after first login!');
        } catch (error) {
            this.logger.error('❌ Failed to create default admin user:', error);
            // Don't throw error to prevent application from failing to start
            // The admin can be created manually if needed
        }
    }
}
