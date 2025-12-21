import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('Missing authorization header');
        }

        let token = authHeader;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }

        const secret = this.configService.get<string>('LIVEKIT_API_SECRET');
        if (!secret) {
            throw new Error('LIVEKIT_API_SECRET not configured');
        }

        try {
            const decoded = verify(token, secret);
            // Set decoded JWT to req.user for controllers to use
            request.user = decoded;
            return true;
        } catch (e) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
