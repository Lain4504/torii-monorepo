import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

export type AuthHealthResponse = { service: string; status: string };
export type ValidateTokenResponse = { isValid: boolean };

@Injectable()
export class GatewayService {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  async pingAuth(): Promise<AuthHealthResponse> {
    return lastValueFrom(
      this.authClient.send<AuthHealthResponse>({ cmd: 'auth.ping' }, {}),
    );
  }

  async validateToken(token?: string): Promise<ValidateTokenResponse> {
    return lastValueFrom(
      this.authClient.send<ValidateTokenResponse>(
        { cmd: 'auth.validate-token' },
        { token },
      ),
    );
  }
}
