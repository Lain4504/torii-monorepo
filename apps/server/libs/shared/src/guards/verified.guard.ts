import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserStatus } from '@workspace/schemas';

@Injectable()
export class VerifiedGuard implements CanActivate {
    constructor(private readonly prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const sub = request.requester?.sub;

        if (!sub) {
            return false;
        }

        const user = await this.prisma.user.findUnique({
            where: { id: sub },
            select: { status: true },
        });

        if (!user || user.status !== UserStatus.ACTIVE) {
            throw new ForbiddenException(
                'Vui lòng xác thực email để thực hiện chức năng này.'
            );
        }

        return true;
    }
}
