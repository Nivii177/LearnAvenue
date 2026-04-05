import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

export interface JwtPayload {
  sub: string; // teacher id
  email: string;
}

// Reads the JWT from the httpOnly 'access_token' cookie
function extractFromCookie(req: Request): string | null {
  return (req.cookies as Record<string, string | undefined>)['access_token'] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractFromCookie]),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET'] ?? 'dev-secret',
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, email: true, name: true, phone: true, createdAt: true, updatedAt: true },
    });

    if (!teacher) throw new UnauthorizedException();
    return teacher;
  }
}
