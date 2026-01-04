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

// Zod Schema
export const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(ErrEmailInvalid.message),
    displayName: z.string().min(2, ErrFirstNameAtLeast2Chars.message),
    password: z.string().min(8, ErrPasswordAtLeast8Chars.message),
    salt: z.string().min(8),
    phone: z.string().optional().nullable(),
    avatarUrl: z.string().url().optional().nullable(),
    bio: z.string().max(500).optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.enum(['male', 'female', 'other']).optional().nullable(),
    jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).optional().nullable(),
    role: z.nativeEnum(UserRole),
    status: z.nativeEnum(UserStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
