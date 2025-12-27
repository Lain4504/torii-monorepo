import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import type { Request } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';
import { PrismaService } from '../prisma.service';

/**
 * JwtGuard verifies Supabase JWT token from:
 * 1. HttpOnly cookie (access_token) - preferred for web-admin frontend
 * 2. Authorization header - fallback for backward compatibility
 * 
 * Sets request.user with authenticated user information
 */
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Try to get token from HttpOnly cookie first (preferred for web-admin)
    let token: string | undefined = (request.cookies as any)?.access_token;
    
    // Fallback to Authorization header for backward compatibility
    if (!token) {
      const authHeader = request.headers['authorization'];
      token = authHeader?.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;
    }

    if (!token) {
      throw new UnauthorizedException('Token is missing. Please login again.');
    }

    try {
      // Verify token with Supabase
      const { data, error } = await this.supabase.auth.getUser(token);
      
      if (error || !data.user) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      // Get user role from database (not from token)
      const dbUser = await this.prisma.user.findUnique({
        where: { id: data.user.id },
        select: { id: true, email: true, role: true, status: true },
      });

      // Attach user to request
      (request as any).user = {
        id: data.user.id,
        email: data.user.email,
        role: dbUser?.role || 'learner', // Get role from database
        status: dbUser?.status || 'active',
        metadata: data.user.user_metadata,
      };
      
      return true;
    } catch (error) {
      throw new UnauthorizedException(
        `Invalid token: ${error.message || 'Token verification failed'}`,
      );
    }
  }
}
