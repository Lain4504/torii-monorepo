import { z } from 'zod';
import { userResponseDTOSchema } from './user.dto';

/**
 * Auth Response DTO - Used for register and OAuth flows
 * Contains user data and access token
 */
export const authResponseDTOSchema = z.object({
    user: userResponseDTOSchema,
    accessToken: z.string(),
});

export type AuthResponseDTO = z.infer<typeof authResponseDTOSchema>;

/**
 * Login Response DTO - Supports 2FA flow
 * If 2FA is required, only tempToken is returned
 * Otherwise, user and accessToken are returned
 */
export const loginResponseDTOSchema = z.object({
    requiresTwoFactor: z.boolean(),
    twoFactorMethod: z.enum(['totp']).optional(),
    tempToken: z.string().optional(),
    user: userResponseDTOSchema.optional(),
    accessToken: z.string().optional(),
});

export type LoginResponseDTO = z.infer<typeof loginResponseDTOSchema>;

/**
 * Auth Result DTO - Generic result for auth operations
 */
export const authResultDTOSchema = z.object({
    success: z.boolean(),
    data: z.union([
        authResponseDTOSchema,
        z.object({ user: userResponseDTOSchema })
    ]).optional(),
    message: z.string().optional(),
});

export type AuthResultDTO = z.infer<typeof authResultDTOSchema>;
