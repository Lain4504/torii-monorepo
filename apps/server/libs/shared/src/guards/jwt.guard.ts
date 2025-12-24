import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.constants';
import { PrismaService } from '../prisma.service';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

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
      request.user = {
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
