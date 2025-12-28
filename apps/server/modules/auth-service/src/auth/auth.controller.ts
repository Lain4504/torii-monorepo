import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { UserRegistrationDTO, UserLoginDTO } from '@workspace/schemas';
import { AuthService } from './auth.service';

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
        const token = await this.authService.login(dto);
        return { success: true, data: token };
    }

    @MessagePattern({ cmd: 'auth.signout' })
    async signout(@Payload() payload: { token: string }) {
        // TODO: Implement token revocation logic (e.g., blacklist token in Redis)
        // For now, just return success as logout is typically handled client-side
        return { success: true, message: 'Logged out successfully' };
    }
}
