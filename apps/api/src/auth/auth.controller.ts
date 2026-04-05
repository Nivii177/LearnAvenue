import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const COOKIE_BASE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env['NODE_ENV'] === 'production',
};

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('access_token', accessToken, {
    ...COOKIE_BASE,
    maxAge: 15 * 60 * 1000, // 15 min
  });
  res.cookie('refresh_token', refreshToken, {
    ...COOKIE_BASE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/auth/refresh',
  });
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { teacher, accessToken, refreshToken } = await this.authService.register(dto);
    setAuthCookies(res, accessToken, refreshToken);
    return { teacher };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { teacher, accessToken, refreshToken } = await this.authService.login(dto);
    setAuthCookies(res, accessToken, refreshToken);
    return { teacher };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return req.user;
  }
}
