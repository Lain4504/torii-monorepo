/**
 * API Key Auth Guard
 * Equivalent to Go: AuthController.HandleAuthHeaderCheck middleware
 * 
 * Verifies API-KEY and HASH-SIGNATURE headers
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import * as crypto from 'crypto';
import { sendCommonProtoJsonResponse } from '../utils/common';
import { ConfigService } from '@nestjs/config';

/**
 * ApiKeyGuard verifies API-KEY and HASH-SIGNATURE
 * Equivalent to Go: ac.HandleAuthHeaderCheck
 * 
 * Validates:
 * - API-KEY header matches configured key
 * - HASH-SIGNATURE matches HMAC-SHA256 of request body
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) { }

  canActivate(context: ExecutionContext): boolean {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const apiKey = request.headers['api-key'] as string;
    const signature = request.headers['hash-signature'] as string;

    // Get configured API key and secret
    const configApiKey = this.configService.get<string>('WAJLC_API_KEY');
    const configSecret = this.configService.get<string>('WAJLC_API_SECRET');

    if (!configApiKey || !configSecret) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      sendCommonProtoJsonResponse(response, false, 'Server configuration error');
      return false;
    }

    // Validate API key (matching Go)
    if (apiKey !== configApiKey) {
      response.status(HttpStatus.UNAUTHORIZED);
      sendCommonProtoJsonResponse(response, false, 'Invalid API key');
      return false;
    }

    // Validate signature presence (matching Go)
    if (!signature) {
      response.status(HttpStatus.UNAUTHORIZED);
      sendCommonProtoJsonResponse(response, false, 'Hash signature value required');
      return false;
    }

    // Verify HMAC signature (matching Go)
    const body = (request as any).rawBody || request.body;
    const bodyBuffer = Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body));

    const mac = crypto.createHmac('sha256', configSecret);
    mac.update(bodyBuffer);
    const expectedSignature = mac.digest('hex');

    // Constant-time comparison (matching Go: subtle.ConstantTimeCompare)
    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    )) {
      response.status(HttpStatus.UNAUTHORIZED);
      sendCommonProtoJsonResponse(response, false, "Can't verify provided information");
      return false;
    }

    return true;
  }
}
