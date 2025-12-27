import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  @Post('register')
  async register(@Body() body: any, @Res() res: Response) {
    try {
      const result = await firstValueFrom(this.natsClient.send({ cmd: 'auth.signup' }, body));
      
      // Set HttpOnly cookies if session exists (for web-admin frontend)
      if (result?.session?.access_token) {
        const isProduction = process.env.NODE_ENV === 'production';
        
        res.cookie('access_token', result.session.access_token, {
          httpOnly: true, // JavaScript cannot read this cookie
          secure: isProduction, // Only send over HTTPS in production
          sameSite: 'strict', // CSRF protection
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        });

        // Set refresh token if available
        if (result.session?.refresh_token) {
          res.cookie('refresh_token', result.session.refresh_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/',
          });
        }
      }
      
      // Return response (keep original behavior for compatibility)
      return res.json(result);
    } catch (error: any) {
      return res.status(400).json({
        error: error?.message || 'Registration failed',
      });
    }
  }

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    try {
      const result = await firstValueFrom(this.natsClient.send({ cmd: 'auth.signin' }, body));
      
      // Set HttpOnly cookies if session exists (for web-admin frontend)
      if (result?.session?.access_token) {
        const isProduction = process.env.NODE_ENV === 'production';
        
        res.cookie('access_token', result.session.access_token, {
          httpOnly: true, // JavaScript cannot read this cookie
          secure: isProduction, // Only send over HTTPS in production
          sameSite: 'strict', // CSRF protection
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          path: '/',
        });

        // Set refresh token if available
        if (result.session?.refresh_token) {
          res.cookie('refresh_token', result.session.refresh_token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            path: '/',
          });
        }
      }
      
      // Return response (keep original behavior for compatibility)
      return res.json(result);
    } catch (error: any) {
      return res.status(401).json({
        error: error?.message || 'Login failed',
      });
    }
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    try {
      const result = await firstValueFrom(this.natsClient.send({ cmd: 'auth.signout' }, {}));
      
      // Clear HttpOnly cookies (for web-admin frontend)
      const isProduction = process.env.NODE_ENV === 'production';
      
      res.clearCookie('access_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
      });
      
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
      });
      
      // Return response (keep original behavior for compatibility)
      return res.json(result || { message: 'Logged out successfully' });
    } catch (error: any) {
      // Clear cookies even if signout fails
      const isProduction = process.env.NODE_ENV === 'production';
      res.clearCookie('access_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
      });
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
      });
      
      return res.status(500).json({
        error: error?.message || 'Logout failed',
      });
    }
  }
}

