import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { VerifiedGuard } from './verified.guard';
import { GatewayAuthGuard } from './gateway-auth.guard';

export const VerifiedOnly = () => applyDecorators(
    UseGuards(GatewayAuthGuard, VerifiedGuard)
);
