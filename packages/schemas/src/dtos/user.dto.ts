import { z } from 'zod';
import { userSchema } from '../models/user.model';

// Registration DTO
export const userRegistrationDTOSchema = z.object({
    email: userSchema.shape.email,
    password: userSchema.shape.password,
    displayName: userSchema.shape.displayName.optional(), // Optional for email+password only registration
});

export type UserRegistrationDTO = z.infer<typeof userRegistrationDTOSchema>;

// Login DTO  
export const userLoginDTOSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export type UserLoginDTO = z.infer<typeof userLoginDTOSchema>;

// Admin Create User DTO
export const userCreateDTOSchema = userSchema
    .pick({
        email: true,
        displayName: true,
        password: true,
        role: true,
        status: true,
        phone: true,
        avatarUrl: true,
        bio: true,
        dateOfBirth: true,
        gender: true,
        jlptLevel: true,
    })
    .extend({
        role: userSchema.shape.role.optional(),
        status: userSchema.shape.status.optional(),
    });

export type UserCreateDTO = z.infer<typeof userCreateDTOSchema>;

// Update DTO
export const userUpdateDTOSchema = userSchema
    .pick({
        displayName: true,
        password: true,
    })
    .partial();

export type UserUpdateDTO = z.infer<typeof userUpdateDTOSchema>;

// Admin Update DTO (includes role/status/email)
export const userAdminUpdateDTOSchema = userUpdateDTOSchema.extend({
    email: userSchema.shape.email.optional(),
    role: userSchema.shape.role.optional(),
    status: userSchema.shape.status.optional(),
}).partial();

export type UserAdminUpdateDTO = z.infer<typeof userAdminUpdateDTOSchema>;

// Query/Filter DTO
export const userCondDTOSchema = userSchema
    .pick({
        email: true,
        displayName: true,
        role: true,
        status: true,
    })
    .partial();

export type UserCondDTO = z.infer<typeof userCondDTOSchema>;

// Response DTO (safe for client - no password/salt)
export const userResponseDTOSchema = userSchema.omit({
    password: true,
    salt: true,
});

export type UserResponseDTO = z.infer<typeof userResponseDTOSchema>;
