import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { TokenPayload } from '@workspace/schemas';

@Injectable()
export class JwtTokenProvider {
    private readonly secretKey: string;
    private readonly expiresIn: string;

    constructor(private config: ConfigService) {
        this.secretKey = config.get<string>('JWT_SECRET')!;
        this.expiresIn = config.get<string>('JWT_EXPIRES_IN', '7d')!;
    }

    async generateToken(payload: TokenPayload): Promise<string> {
        return jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn });
    }

    async verifyToken(token: string): Promise<TokenPayload | null> {
        try {
            const decoded = jwt.verify(token, this.secretKey) as TokenPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }
}
