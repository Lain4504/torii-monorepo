import { z } from 'zod';
import { userSchema, UserRole } from '../models/user.model';

// Registration DTO
export const userRegistrationDTOSchema = z.object({
    email: userSchema.shape.email,
    password: userSchema.shape.password,
    displayName: userSchema.shape.displayName.optional(), // Optional for email+password only registration
    platform: z.enum(['web', 'mobile']).optional().default('web'),
});

export type UserRegistrationDTO = z.infer<typeof userRegistrationDTOSchema>;

// Login DTO  
export const userLoginDTOSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export type UserLoginDTO = z.infer<typeof userLoginDTOSchema>;

// Admin Create User DTO (for external users - with password)
export const userCreateDTOSchema = userSchema
    .pick({
        email: true,
        displayName: true,
        password: true,
        role: true,
    })
    .extend({
        role: userSchema.shape.role.optional(),
    });

export type UserCreateDTO = z.infer<typeof userCreateDTOSchema>;

// Admin Create Internal User DTO (for LECTURE/STAFF - no password, invite email)
export const adminCreateInternalUserDTOSchema = z.object({
    email: userSchema.shape.email,
    displayName: userSchema.shape.displayName,
    role: z.enum([
        UserRole.LECTURER,
        UserRole.STAFF,
        UserRole.STAFF_LMS,
        UserRole.STAFF_SUPPORT,
        UserRole.STAFF_SALES,
    ]),
});

export type AdminCreateInternalUserDTO = z.infer<typeof adminCreateInternalUserDTOSchema>;

// Update DTO (minimal auth fields)
export const userUpdateDTOSchema = userSchema
    .pick({
        displayName: true,
        password: true,
    })
    .partial();

export type UserUpdateDTO = z.infer<typeof userUpdateDTOSchema>;

// Admin Update DTO (includes role/email)
export const userAdminUpdateDTOSchema = userUpdateDTOSchema.extend({
    email: userSchema.shape.email.optional(),
    role: userSchema.shape.role.optional(),
}).partial();

export type UserAdminUpdateDTO = z.infer<typeof userAdminUpdateDTOSchema>;

// Query/Filter DTO
export const userCondDTOSchema = userSchema
    .pick({
        email: true,
        displayName: true,
        role: true,
    })
    .partial();

export type UserCondDTO = z.infer<typeof userCondDTOSchema>;

// Response DTO (safe for client - no password)
export const userResponseDTOSchema = userSchema.omit({
    password: true,
}).extend({
    linkedMethods: z.array(z.string()).optional(),
    coinBalance: z.number().int().optional(),
});

export type UserResponseDTO = z.infer<typeof userResponseDTOSchema>;

// ========================================
// Invite Token DTOs (for internal users)
// ========================================

// Verify invite token DTO
export const verifyInviteTokenDTOSchema = z.object({
    token: z.string().min(1, 'Token is required'),
});

export type VerifyInviteTokenDTO = z.infer<typeof verifyInviteTokenDTOSchema>;

// Set password for invited user DTO
export const setPasswordDTOSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: userSchema.shape.password,
});

export type SetPasswordDTO = z.infer<typeof setPasswordDTOSchema>;

