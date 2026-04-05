import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.teacher.findFirst({
      where: { id, deletedAt: null },
      select: SAFE_SELECT,
    });
  }
}
