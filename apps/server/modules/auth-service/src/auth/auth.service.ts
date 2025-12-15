import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '@server/shared';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  ping() {
    return { service: 'auth', status: 'ok' };
  }

  validateToken(token?: string) {
    const isValid = Boolean(token && token.length > 10);
    return { isValid };
  }

  async signUp(dto: any) {
    const { email, password } = dto;
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async signIn(dto: any) {
    const { email, password } = dto;
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    return { message: 'Signed out' };
  }
}
