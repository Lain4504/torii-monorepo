
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenProvider } from '../providers/jwt-token.provider';
import { BlacklistService } from '../services/blacklist.service';

@Injectable()
export class GatewayAuthGuard implements CanActivate {
    private readonly logger = new Logger(GatewayAuthGuard.name);

    constructor(
        private readonly jwtTokenProvider: JwtTokenProvider,
        private readonly blacklistService: BlacklistService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractToken(request);

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        const payload = await this.jwtTokenProvider.verifyToken(token);
        if (!payload) {
            this.logger.warn(`Token verification failed`);
            throw new UnauthorizedException();
        }

        // Check if token is blacklisted
        if (payload.jti) {
            const isBlacklisted = await this.blacklistService.isBlacklisted(payload.jti);
            if (isBlacklisted) {
                this.logger.warn(`Token is blacklisted: ${payload.jti}`);
                throw new UnauthorizedException('Token revoked');
            }
        }

        // Assign payload to request
        request['user'] = payload;
        request['requester'] = { sub: payload.sub, role: payload.role };

        return true;
    }

    private extractToken(request: Request): string | undefined {
        // 1. Check Header (Mobile/API)
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        if (type === 'Bearer' && token) {
            return token;
        }

        // 2. Check Cookie (Web)
        if (request.cookies && request.cookies['access_token']) {
            return request.cookies['access_token'];
        }

        return undefined;
    }
}
