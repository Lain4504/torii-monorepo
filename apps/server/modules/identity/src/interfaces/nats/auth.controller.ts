import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { UserRegistrationDTO, UserLoginDTO } from '@workspace/schemas';
import { AuthService } from '../../modules/auth/auth.service';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @MessagePattern({ cmd: 'auth.signup' })
    async signup(@Payload() dto: UserRegistrationDTO) {
        const userId = await this.authService.register(dto);
        return { success: true, data: userId };
    }

    @MessagePattern({ cmd: 'auth.signin' })
    async signin(@Payload() dto: UserLoginDTO) {
        const tokens = await this.authService.login(dto);
        return { success: true, data: tokens };
    }

    @MessagePattern({ cmd: 'auth.refresh' })
    async refresh(@Payload() payload: { refreshToken: string }) {
        const accessToken = await this.authService.refreshAccessToken(payload.refreshToken);
        return { success: true, data: { accessToken } };
    }

    @MessagePattern({ cmd: 'auth.signout' })
    async signout(@Payload() payload: { token: string }) {
        // TODO: Implement token revocation logic (e.g., blacklist token in Redis)
        // For now, just return success as logout is typically handled client-side
        return { success: true, message: 'Logged out successfully' };
    }
}
