import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@Injectable()
export class BatchesService {
  constructor(private prisma: PrismaService) {}

  findAllForTeacher(teacherId: string) {
    return this.prisma.batch.findMany({
      where: { teacherId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string, teacherId: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id, deletedAt: null },
    });
    if (!batch) throw new NotFoundException('Batch not found');
    if (batch.teacherId !== teacherId) throw new ForbiddenException();
    return batch;
  }

  create(teacherId: string, dto: CreateBatchDto) {
    return this.prisma.batch.create({
      data: { ...dto, teacherId },
    });
  }

  async update(id: string, teacherId: string, dto: UpdateBatchDto) {
    await this.findOne(id, teacherId); // ownership check
    return this.prisma.batch.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, teacherId: string) {
    await this.findOne(id, teacherId); // ownership check
    return this.prisma.batch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
