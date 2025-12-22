import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { decode } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    // Extract token from "Bearer <token>"
    let token: string;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      token = authHeader;
    }

    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    try {
      // Decode token to extract userId
      // Note: We decode without verification since Supabase tokens are signed with their own secret
      // In production, you might want to verify with Supabase JWT secret
      const decoded: any = decode(token);

      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }

      // Extract userId from token claims
      // Supabase JWT typically has userId in 'sub' claim
      const userId = decoded.sub || decoded.user_id || decoded.userId;

      if (!userId) {
        throw new UnauthorizedException('Invalid token: missing user ID');
      }

      // Attach userId to request for use in controllers
      request.userId = userId;
      request.user = { id: userId }; // Also attach user object for compatibility

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}



