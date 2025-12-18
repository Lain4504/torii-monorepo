import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT, LiveKitService } from '@server/shared';

@Injectable()
export class AuthService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly liveKitService: LiveKitService,
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

  async createToken(payload: {
    roomName: string;
    participantName: string;
    identity: string;
  }) {
    const { roomName, participantName, identity } = payload;
    const token = await this.liveKitService.createAccessToken(
      identity,
      participantName,
      {
        roomJoin: true,
        room: roomName,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
      },
    );
    return { token };
  }
}

