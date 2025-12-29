import { z } from 'zod';

// Enums
export enum UserRole {
    ADMIN = 'admin',
    LECTURER = 'lecturer',
    LEARNER = 'learner',
    STAFF = 'staff',
}

export enum UserStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    INACTIVE = 'inactive',
    BANNED = 'banned',
    DELETED = 'deleted',
}

// Business Errors
export const ErrFirstNameAtLeast2Chars = new Error('First name must be at least 2 characters');
export const ErrEmailInvalid = new Error('Email is invalid');
export const ErrPasswordAtLeast8Chars = new Error('Password must be at least 8 characters');
export const ErrEmailExisted = new Error('Email already exists');
export const ErrInvalidCredentials = new Error('Invalid email or password');
export const ErrUserInactivated = new Error('User is inactivated or banned');
export const ErrInvalidToken = new Error('Invalid token');
export const ErrUserNotFound = new Error('User not found');
export const ErrForbidden = new Error('Forbidden');

// Zod Schema - Auth Only Fields
export const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(ErrEmailInvalid.message),
    fullName: z.string().min(2, ErrFirstNameAtLeast2Chars.message),
    password: z.string().min(8, ErrPasswordAtLeast8Chars.message),
    salt: z.string().min(8),
    role: z.nativeEnum(UserRole),
    status: z.nativeEnum(UserStatus),
    emailVerified: z.boolean().default(false),
    lastLoginAt: z.date().optional().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().optional().nullable(),
});

export type User = z.infer<typeof userSchema>;
