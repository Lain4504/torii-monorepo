import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthServiceService {
  ping() {
    return { service: 'auth', status: 'ok' };
  }

  validateToken(token?: string) {
    const isValid = Boolean(token && token.length > 10);
    return { isValid };
  }
}
