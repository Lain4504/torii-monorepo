import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify which roles are allowed for a route
 * @param roles - Array of roles that are allowed to access the route
 * 
 * Usage:
 * @Roles('admin', 'staff')
 * async findAll() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
