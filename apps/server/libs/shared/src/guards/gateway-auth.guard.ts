import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtTokenProvider } from '../providers/jwt-token.provider';
import { BlacklistService } from '../services/blacklist.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class GatewayAuthGuard implements CanActivate {
    private readonly logger = new Logger(GatewayAuthGuard.name);

    constructor(
        private readonly jwtTokenProvider: JwtTokenProvider,
        private readonly blacklistService: BlacklistService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        this.logger.log(`[GatewayAuthGuard] Checking auth for ${request.url}`);

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const token = this.extractToken(request);
        this.logger.log(`[GatewayAuthGuard] Token extracted: ${token ? 'Yes' : 'No'}`);

        if (isPublic) {
            // Even if public, try to extract user info if token exists
            if (token) {
                try {
                    const payload = await this.jwtTokenProvider.verifyToken(token);
                    if (payload) {
                        request['user'] = payload;
                        request['requester'] = { sub: payload.sub, role: payload.role };
                    }
                } catch (e) {
                    // Ignore error for public routes
                }
            }
            return true;
        }

        if (!token) {
            this.logger.warn('[GatewayAuthGuard] No token provided');
            throw new UnauthorizedException('No token provided');
        }

        const payload = await this.jwtTokenProvider.verifyToken(token);
        if (!payload) {
            this.logger.warn(`[GatewayAuthGuard] Token verification failed`);
            throw new UnauthorizedException();
        }

        // Check if token is blacklisted
        if (payload.jti) {
            const isBlacklisted = await this.blacklistService.isBlacklisted(payload.jti);
            if (isBlacklisted) {
                this.logger.warn(`[GatewayAuthGuard] Token is blacklisted: ${payload.jti}`);
                throw new UnauthorizedException('Token revoked');
            }
        }

        // Assign payload to request
        request['user'] = payload;
        request['requester'] = {
            sub: payload.sub,
            role: payload.role,
            permissions: payload.permissions || []
        };

        this.logger.log(`[GatewayAuthGuard] Auth check passed for user ${payload.sub}`);
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

        this.logger.debug('[GatewayAuthGuard] No token in Header or Cookies');
        // console.log('Cookies:', request.cookies); 

        return undefined;
    }
}
