import { Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany();
    }
}
