
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.permissions) {
            // If user is authenticated but has no permissions list attached, 
            // it might be an old token or a misconfiguration.
            // Admin role usually has '*' wildcard.
            if (user?.role === 'admin') return true;
            throw new UnauthorizedException('User permissions not found');
        }

        const userPermissions = user.permissions as string[];

        // Wildcard check
        if (userPermissions.includes('*')) {
            return true;
        }

        // Check if user has ALL required permissions for this endpoint
        // (Alternative: could be SOME, but usually ALL is safer for atomic permissions)
        const hasAllPermissions = requiredPermissions.every((perm) => userPermissions.includes(perm));

        if (!hasAllPermissions) {
            const missing = requiredPermissions.filter(p => !userPermissions.includes(p));
            throw new ForbiddenException(`Missing required permissions: ${missing.join(', ')}`);
        }

        return true;
    }
}
