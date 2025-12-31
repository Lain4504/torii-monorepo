import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseAuthService } from '../firebase/firebase-auth.service';
import { PrismaService } from '../prisma.service';
import { UserStatus } from '@workspace/schemas';

/**
 * Firebase Authentication Guard
 * Verifies Firebase ID token and loads user from database
 * Replaces RemoteAuthGuard for Firebase-based authentication
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    constructor(
        private readonly firebaseAuth: FirebaseAuthService,
        private readonly prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            // Verify Firebase ID token
            const decodedToken = await this.firebaseAuth.verifyIdToken(token);

            if (!decodedToken) {
                throw new UnauthorizedException('Invalid Firebase token');
            }

            // Lookup user in database by Firebase UID
            const user = await this.prisma.user.findUnique({
                where: { firebaseUid: decodedToken.uid },
                select: {
                    id: true,
                    firebaseUid: true,
                    email: true,
                    role: true,
                    status: true,
                    fullName: true,
                }
            });

            if (!user) {
                throw new UnauthorizedException('User not found in database');
            }

            // Check user status
            if ([UserStatus.DELETED, UserStatus.INACTIVE, UserStatus.BANNED]
                .includes(user.status as UserStatus)) {
                throw new UnauthorizedException('User is not active');
            }

            // Create payload in same format as before (for RBAC compatibility)
            const payload = {
                sub: user.id,
                role: user.role,
                email: user.email,
                firebaseUid: user.firebaseUid,
            };

            // Set both for compatibility
            request['user'] = payload;
            request['requester'] = payload; // Legacy support for existing code
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Authentication failed: ' + error.message);
        }

        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        // Extract token from Authorization header
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
