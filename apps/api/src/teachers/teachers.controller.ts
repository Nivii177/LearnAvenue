import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('teachers')
export class TeachersController {
  @Get('me')
  getProfile(@Req() req: Request) {
    return req.user;
  }
}
