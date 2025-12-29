import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma.service';
import { UserStatus } from '@workspace/schemas';
import { JwtTokenProvider } from '../providers/jwt-token.provider';

@Injectable()
export class RemoteAuthGuard implements CanActivate {
    constructor(
        private readonly tokenProvider: JwtTokenProvider,
        private readonly prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const payload = await this.tokenProvider.verifyToken(token);

            if (!payload) {
                throw new UnauthorizedException('Invalid token');
            }

            // Check user status
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            if ([UserStatus.DELETED, UserStatus.INACTIVE, UserStatus.BANNED].includes(user.status as UserStatus)) {
                throw new UnauthorizedException('User is not active');
            }

            request['requester'] = payload;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Authentication failed');
        }

        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        // First try to get token from cookies (preferred method)
        if (request.cookies?.accessToken) {
            return request.cookies.accessToken;
        }

        // Fallback to Authorization header for backward compatibility
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
