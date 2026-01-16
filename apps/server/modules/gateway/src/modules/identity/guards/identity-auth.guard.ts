import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpStatus,
    Inject,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { errorResponse } from '@server/shared';
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
        const response = ctx.getResponse<Response>();
        let authToken = request.headers.authorization;

        // Check if Authorization header exists
        if (!authToken) {
            // Try to get token from cookies
            if (request.cookies && request.cookies.access_token) {
                authToken = request.cookies.access_token;
            } else {
                response.status(HttpStatus.UNAUTHORIZED).json(
                    errorResponse('Authorization header is missing')
                );
                return false;
            }
        }

        try {
            const payload = await this.jwtTokenProvider.verifyToken(authToken!);
            if (payload) {
                // Attach standard user object
                (request as any).user = payload;
                (request as any).requestedUserId = payload.sub;

                // Compatibility mapping
                (request as any).isAdmin = payload.role === UserRole.ADMIN || payload.role === UserRole.STAFF;

                return true;
            } else {
                response.status(HttpStatus.UNAUTHORIZED).json(
                    errorResponse('Invalid or expired token')
                );
                return false;
            }
        } catch (error) {
            response.status(HttpStatus.UNAUTHORIZED).json(
                errorResponse(error instanceof Error ? error.message : 'Invalid token')
            );
            return false;
        }
    }
}
