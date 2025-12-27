/**
 * JWT Auth Guard
 *
 * Verifies JWT token from HttpOnly cookie (preferred) or Authorization header (fallback)
 * and sets request locals
 */

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { verifyWajlcAccessToken } from '../utils/verify_token';
import { sendCommonProtoJsonResponse } from '../utils/common';
import { ConfigService } from '@nestjs/config';

/**
 * JwtAuthGuard verifies the token from:
 * 1. HttpOnly cookie (access_token) - preferred for web-admin frontend
 * 2. Authorization header - fallback for backward compatibility
 *
 * Sets request properties:
 * - req.isAdmin
 * - req.roomId
 * - req.requestedUserId
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();
        
        // Try to get token from HttpOnly cookie first (preferred for web-admin)
        let authToken: string | undefined = (request.cookies as any)?.access_token;
        
        // Fallback to Authorization header for backward compatibility
        if (!authToken) {
            const authHeader = request.headers.authorization;
            // Remove 'Bearer ' prefix if present
            authToken = authHeader?.startsWith('Bearer ') 
                ? authHeader.substring(7) 
                : authHeader;
        }

        // Determine error status based on path
        const path = request.path;
        const errStatus = path.includes('file_upload')
            ? HttpStatus.BAD_REQUEST
            : HttpStatus.UNAUTHORIZED;

        // Check if token exists
        if (!authToken) {
            response.status(errStatus);
            sendCommonProtoJsonResponse(response, false, 'Token is missing. Please login again.');
            return false;
        }

        // Verify token
        try {
            const apiKey = this.configService.get<string>('WAJLC_API_KEY');
            const secret = this.configService.get<string>('WAJLC_API_SECRET');

            if (!apiKey || !secret) {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR);
                sendCommonProtoJsonResponse(response, false, 'Server configuration error');
                return false;
            }

            const claims = verifyWajlcAccessToken(
                apiKey,
                secret,
                authToken,
                0, // No graceful period
            );

            // Set request properties
            (request as any).isAdmin = claims.isAdmin;
            (request as any).roomId = claims.roomId;
            (request as any).requestedUserId = claims.userId;

            return true;
        } catch (error) {
            response.status(errStatus);
            sendCommonProtoJsonResponse(
                response,
                false,
                error instanceof Error ? error.message : 'Invalid token'
            );
            return false;
        }
    }
}
