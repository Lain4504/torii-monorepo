import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import type { UserRegistrationDTO, UserLoginDTO, UserUpdateDTO, ReqWithRequester } from '@workspace/schemas';
import { RemoteAuthGuard } from '@server/shared';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  // ================== Authentication Routes ==================

  @Post('register')
  async register(@Body() dto: UserRegistrationDTO) {
    return firstValueFrom(this.natsClient.send({ cmd: 'auth.signup' }, dto));
  }

  @Post('login')
  async login(@Body() dto: UserLoginDTO, @Request() req: any) {
    const result = await firstValueFrom(this.natsClient.send({ cmd: 'auth.signin' }, dto));

    if (result.success && result.data) {
      const { accessToken, refreshToken } = result.data;
      const isProduction = process.env.NODE_ENV === 'production';

      // Set access token cookie (15 minutes)
      req.res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
      });

      // Set refresh token cookie (7 days)
      req.res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
      });

      return { success: true, message: 'Login successful' };
    }

    return result;
  }

  @Post('logout')
  @UseGuards(RemoteAuthGuard)
  async logout(@Request() req: any) {
    // Clear cookies
    req.res.clearCookie('accessToken', { path: '/' });
    req.res.clearCookie('refreshToken', { path: '/' });

    await firstValueFrom(this.natsClient.send({ cmd: 'auth.signout' }, {}));
    return { success: true, message: 'Logout successful' };
  }

  @Post('refresh')
  async refresh(@Request() req: any) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return { success: false, message: 'Refresh token not found' };
    }

    const result = await firstValueFrom(
      this.natsClient.send({ cmd: 'auth.refresh' }, { refreshToken })
    );

    if (result.success && result.data) {
      const { accessToken } = result.data;
      const isProduction = process.env.NODE_ENV === 'production';

      // Set new access token cookie
      req.res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'strict' : 'lax',
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: '/',
      });

      return { success: true, message: 'Token refreshed' };
    }

    return result;
  }

  // ================== User Profile Routes ==================

  @Get('profile')
  @UseGuards(RemoteAuthGuard)
  async getProfile(@Request() req: ReqWithRequester) {
    // Get profile with RBAC data (role, permissions, staffTemplate)
    return firstValueFrom(
      this.natsClient.send({ cmd: 'user.profileWithRBAC' }, req.requester.sub)
    );
  }

  @Patch('profile')
  @UseGuards(RemoteAuthGuard)
  async updateProfile(@Request() req: ReqWithRequester, @Body() dto: UserUpdateDTO) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'users.update' }, {
        id: req.requester.sub,
        requester: req.requester,
        ...dto,
      })
    );
  }

  @Delete('profile')
  @UseGuards(RemoteAuthGuard)
  async deleteProfile(@Request() req: ReqWithRequester) {
    return firstValueFrom(
      this.natsClient.send({ cmd: 'users.delete' }, {
        id: req.requester.sub,
        requester: req.requester,
      })
    );
  }
}

