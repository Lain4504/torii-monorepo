import { Body, Controller, Delete, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '@server/shared';
import { PrismaService } from '@server/shared';
import { RBACService } from '../../modules/rbac/rbac.service';
import { UserRole, UserStatus } from '@workspace/schemas';
import type { ReqWithRequester } from '@workspace/schemas';

interface FirebaseSyncDTO {
    firebaseUid: string;
    email: string;
    displayName?: string;
}

/**
 * Auth HTTP Controller
 * Handles Firebase authentication and user profile management
 */
@Controller('auth')
export class AuthController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly rbacService: RBACService,
    ) { }

    /**
     * Sync user from Firebase to local database
     * Called by clients after Firebase authentication
     */
    @Post('firebase-sync')
    async firebaseSync(@Body() dto: FirebaseSyncDTO) {
        try {
            const { firebaseUid, email, displayName } = dto;

            // Check if user exists by Firebase UID
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

                // Fall through to get permissions
            } else {
                // User doesn't exist by Firebase UID
                // Check if user exists by email (migration case)
                const existingUserByEmail = await this.prisma.user.findFirst({
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
                }

            }

            // Get permissions
            const { permissions } = await this.rbacService.getUserPermissions(user.id, user.role);

            return {
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.fullName,
                        role: user.role,
                        status: user.status,
                        permissions,
                    },
                },
            };
        } catch (error: any) {
            return {
                success: false,
                message: error?.message || 'Failed to sync user',
            };
        }
    }

    /**
     * Get authenticated user profile
     */
    @Get('profile')
    @UseGuards(FirebaseAuthGuard)
    async getProfile(@Request() req: ReqWithRequester) {
        const user = await this.prisma.user.findUnique({
            where: { id: req.requester.sub },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return {
                success: false,
                message: 'User not found',
            };
        }

        // Get permissions
        const { permissions } = await this.rbacService.getUserPermissions(user.id, user.role);

        return {
            success: true,
            data: {
                user: {
                    ...user,
                    permissions,
                }
            },
        };
    }

    /**
     * Update authenticated user profile
     */
    @Patch('profile')
    @UseGuards(FirebaseAuthGuard)
    async updateProfile(
        @Request() req: ReqWithRequester,
        @Body() dto: { fullName?: string },
    ) {
        const user = await this.prisma.user.update({
            where: { id: req.requester.sub },
            data: {
                fullName: dto.fullName,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
            },
        });

        // Get permissions
        const { permissions } = await this.rbacService.getUserPermissions(user.id, user.role);

        return {
            success: true,
            data: {
                user: {
                    ...user,
                    permissions,
                }
            },
        };
    }

    /**
     * Delete authenticated user profile
     */
    @Delete('profile')
    @UseGuards(FirebaseAuthGuard)
    async deleteProfile(@Request() req: ReqWithRequester) {
        await this.prisma.user.update({
            where: { id: req.requester.sub },
            data: {
                status: UserStatus.DELETED,
                deletedAt: new Date(),
            },
        });

        return {
            success: true,
            message: 'Profile deleted successfully',
        };
    }
}
