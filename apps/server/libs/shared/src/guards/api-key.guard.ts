import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['api-key'];
    const signature = request.headers['hash-signature'];
    const body = request.body;

    const configApiKey = this.configService.get<string>('WAJLC_API_KEY');
    const configSecret = this.configService.get<string>('WAJLC_API_SECRET');

    if (!configApiKey || !configSecret) {
      // If not configured, deny by default or log warning
      console.warn('API Key/Secret not configured in .env');
      return false;
    }

    if (apiKey !== configApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    if (!signature) {
      throw new UnauthorizedException('Missing Hash-Signature');
    }

    // Calculate signature
    // Note: Request body must be raw buffer for accurate hashing.
    // If body-parser parsed it, we need the raw body.
    // In our main.ts or middleware, we should ensure we can access raw body.
    // Assuming body is Buffer or string.
    // If it's a JSON object, JSON.stringify(body) might not match exact raw bytes if whitespace differed.
    // Ideally, for signature verification, we need raw bytes.
    // In `GatewayController.verifyToken`, we see `req.body` handling.
    // We should make sure we're hashing the same content.

    const hmac = crypto.createHmac('sha256', configSecret);
    hmac.update(body);
    const expectedSignature = hmac.digest('hex');

    if (expectedSignature !== signature) {
      throw new UnauthorizedException('Invalid Signature');
    }

    return true;
  }
}
