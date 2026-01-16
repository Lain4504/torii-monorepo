import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Inject,
    UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtTokenProvider } from '@server/shared';
import { UserRole } from '@workspace/schemas';

@Injectable()
export class IdentityAuthGuard implements CanActivate {
    constructor(
        private readonly jwtTokenProvider: JwtTokenProvider
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        let authToken = request.headers.authorization;

        // Check if Authorization header exists
        if (!authToken) {
            // Try to get token from cookies
            if (request.cookies && request.cookies.access_token) {
                authToken = request.cookies.access_token;
            } else {
                throw new UnauthorizedException('Authorization header is missing');
            }
        }

        // We know authToken is defined here, but convince TS
        if (!authToken) {
            throw new UnauthorizedException('Authorization header is missing');
        }

        // Clean up token if it has "Bearer " prefix
        if (authToken.startsWith('Bearer ')) {
            authToken = authToken.substring(7);
        }

        try {
            const payload = await this.jwtTokenProvider.verifyToken(authToken);
            if (payload) {
                // Attach standard user object
                (request as any).user = payload;
                (request as any).requestedUserId = payload.sub;

                // Compatibility mapping
                (request as any).isAdmin = payload.role === UserRole.ADMIN || payload.role === UserRole.STAFF;

                return true;
            } else {
                throw new UnauthorizedException('Invalid or expired token');
            }
        } catch (error) {
            throw new UnauthorizedException(error instanceof Error ? error.message : 'Invalid token');
        }
    }
}
