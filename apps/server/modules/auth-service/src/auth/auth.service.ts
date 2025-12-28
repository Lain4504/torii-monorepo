import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import type {
    UserRegistrationDTO,
    UserLoginDTO,
    TokenPayload,
} from '@workspace/schemas';
import {
    userRegistrationDTOSchema,
    userLoginDTOSchema,
    UserRole,
    UserStatus,
    ErrEmailExisted,
    ErrInvalidCredentials,
    ErrUserInactivated,
    ErrInvalidToken,
} from '@workspace/schemas';
import { PrismaService, JwtTokenProvider } from '@server/shared';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tokenProvider: JwtTokenProvider,
    ) { }

    async register(dto: UserRegistrationDTO): Promise<string> {
        const data = userRegistrationDTOSchema.parse(dto);

        // Check email exists
        const existingUser = await this.prisma.user.findFirst({ where: { email: data.email } });
        if (existingUser) {
            throw new BadRequestException(ErrEmailExisted.message);
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(`${data.password}.${salt}`, 10);

        // Create user
        const newId = uuidv4();
        await this.prisma.user.create({
            data: {
                id: newId,
                email: data.email,
                fullName: data.fullName,
                password: hashedPassword,
                salt,
                role: UserRole.LEARNER,
                status: UserStatus.ACTIVE,
            } as any,
        });
        return newId;
    }

    async login(dto: UserLoginDTO): Promise<string> {
        const data = userLoginDTOSchema.parse(dto);

        // Find user
        const user = await this.prisma.user.findFirst({ where: { email: data.email } });
        if (!user) {
            throw new BadRequestException(ErrInvalidCredentials.message);
        }

        // Verify password
        const isMatch = await bcrypt.compare(`${data.password}.${user.salt}`, user.password);
        if (!isMatch) {
            throw new BadRequestException(ErrInvalidCredentials.message);
        }

        // Check status
        if ([UserStatus.DELETED, UserStatus.INACTIVE, UserStatus.BANNED].includes(user.status as UserStatus)) {
            throw new BadRequestException(ErrUserInactivated.message);
        }

        // Generate token
        const token = await this.tokenProvider.generateToken({
            sub: user.id,
            role: user.role as UserRole,
        });

        return token;
    }

    async introspectToken(token: string): Promise<TokenPayload> {
        const payload = await this.tokenProvider.verifyToken(token);

        if (!payload) {
            throw new BadRequestException(ErrInvalidToken.message);
        }

        const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if ([UserStatus.DELETED, UserStatus.INACTIVE, UserStatus.BANNED].includes(user.status as UserStatus)) {
            throw new BadRequestException(ErrUserInactivated.message);
        }

        return { sub: user.id, role: user.role as UserRole };
    }
}
