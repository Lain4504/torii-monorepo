
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenProvider } from '@server/shared';

@Injectable()
export class GatewayAuthGuard implements CanActivate {
    private readonly logger = new Logger(GatewayAuthGuard.name);

    constructor(private readonly jwtTokenProvider: JwtTokenProvider) { }

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

        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        request['user'] = payload;
        request['requester'] = { sub: payload.sub, role: payload.role }; // Support legacy/existing structure

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
