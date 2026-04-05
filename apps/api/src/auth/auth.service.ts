import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './strategies/jwt.strategy';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.teacher.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const teacher = await this.prisma.teacher.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const tokens = this.signTokens({ sub: teacher.id, email: teacher.email });
    return { teacher, ...tokens };
  }

  async login(dto: LoginDto) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { email: dto.email },
    });

    if (!teacher || teacher.deletedAt) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, teacher.passwordHash);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const { passwordHash: _, ...safeTeacher } = teacher;
    const tokens = this.signTokens({ sub: teacher.id, email: teacher.email });
    return { teacher: safeTeacher, ...tokens };
  }

  private signTokens(payload: JwtPayload) {
    const accessToken = this.jwt.sign(payload, {
      expiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m',
    });
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '30d',
    });
    return { accessToken, refreshToken };
  }
}
