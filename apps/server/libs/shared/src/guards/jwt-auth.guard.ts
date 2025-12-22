/**
 * JWT Auth Guard
 * Equivalent to Go: AuthController.HandleVerifyHeaderToken middleware
 * 
 * Verifies JWT token from Authorization header and sets request locals
 */

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { verifyPlugNmeetAccessToken } from '../utils/verify_token';
import { sendCommonProtoJsonResponse } from '../utils/common';
import { ConfigService } from '@nestjs/config';

/**
 * JwtAuthGuard verifies the Authorization header token
 * Equivalent to Go: ac.HandleVerifyHeaderToken
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
        const authToken = request.headers.authorization;

        // Determine error status based on path (matching Go)
        const path = request.path;
        const errStatus = path.includes('file_upload')
            ? HttpStatus.BAD_REQUEST
            : HttpStatus.UNAUTHORIZED;

        // Check if Authorization header exists
        if (!authToken) {
            response.status(errStatus);
            sendCommonProtoJsonResponse(response, false, 'Authorization header is missing');
            return false;
        }

        // Verify token
        try {
            const apiKey = this.configService.get<string>('MEET_API_KEY');
            const secret = this.configService.get<string>('WAJLC_API_SECRET');

            if (!apiKey || !secret) {
                response.status(HttpStatus.INTERNAL_SERVER_ERROR);
                sendCommonProtoJsonResponse(response, false, 'Server configuration error');
                return false;
            }

            const claims = verifyPlugNmeetAccessToken(
                apiKey,
                secret,
                authToken,
                0, // No graceful period
            );

            // Set request properties (like Go's c.Locals)
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
