import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { UserRole, UserStatus } from '@workspace/schemas';

interface FirebaseSyncRequest {
    firebaseUid: string;
    email: string;
    displayName?: string;
}

/**
 * Firebase Sync Controller
 * Handles syncing Firebase users with local database
 */
@Controller('auth')
export class FirebaseSyncController {
    private readonly logger = new Logger(FirebaseSyncController.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Sync Firebase user to local database
     * Called by mobile/web clients after Firebase authentication
     * 
     * POST /auth/firebase-sync
     */
    @Post('firebase-sync')
    @HttpCode(HttpStatus.OK)
    async syncFirebaseUser(@Body() body: FirebaseSyncRequest) {
        const { firebaseUid, email, displayName } = body;

        try {
            // Check if user already exists by firebaseUid
            let user = await this.prisma.user.findUnique({
                where: { firebaseUid },
            });

            if (user) {
                // User exists, update last sync time
                user = await this.prisma.user.update({
                    where: { firebaseUid },
                    data: {
                        updatedAt: new Date(),
                    },
                });

                this.logger.log(`Existing user synced: ${email}`);
            } else {
                // Check if user exists by email (migration case)
                const existingUserByEmail = await this.prisma.user.findUnique({
                    where: { email },
                });

                if (existingUserByEmail) {
                    // Migrate existing user to Firebase
                    user = await this.prisma.user.update({
                        where: { email },
                        data: {
                            firebaseUid,
                        },
                    });

                    this.logger.log(`Migrated existing user to Firebase: ${email}`);
                } else {
                    // Create new user
                    user = await this.prisma.user.create({
                        data: {
                            firebaseUid,
                            email,
                            fullName: displayName || email.split('@')[0],
                            role: UserRole.LEARNER,
                            status: UserStatus.ACTIVE,
                        },
                    });

                    this.logger.log(`New user created from Firebase: ${email}`);
                }
            }

            // Return user data (excluding sensitive fields)
            return {
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                        status: user.status,
                    },
                },
            };
        } catch (error) {
            this.logger.error(`Failed to sync Firebase user: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Failed to sync user',
            };
        }
    }
}
