import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  findAllForTeacher(teacherId: string, batchId?: string) {
    if (batchId) {
      // Return students enrolled in a specific batch
      return this.prisma.student.findMany({
        where: {
          teacherId,
          deletedAt: null,
          enrollments: {
            some: { batchId, endedAt: null, deletedAt: null },
          },
        },
        include: {
          enrollments: {
            where: { batchId, endedAt: null, deletedAt: null },
            select: { id: true, startedAt: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    }

    return this.prisma.student.findMany({
      where: { teacherId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, teacherId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, deletedAt: null },
      include: {
        enrollments: {
          where: { deletedAt: null, endedAt: null },
          include: { batch: { select: { id: true, name: true } } },
        },
      },
    });
    if (!student) throw new NotFoundException('Student not found');
    if (student.teacherId !== teacherId) throw new ForbiddenException();
    return student;
  }

  async create(teacherId: string, dto: CreateStudentDto) {
    const { batchId, ...studentData } = dto;

    // Verify batch belongs to this teacher if provided
    if (batchId) {
      const batch = await this.prisma.batch.findFirst({
        where: { id: batchId, teacherId, deletedAt: null },
      });
      if (!batch) throw new NotFoundException('Batch not found');
    }

    return this.prisma.student.create({
      data: {
        ...studentData,
        teacherId,
        ...(batchId
          ? {
              enrollments: {
                create: { batchId },
              },
            }
          : {}),
      },
      include: {
        enrollments: batchId
          ? { where: { batchId }, select: { id: true, batchId: true, startedAt: true } }
          : false,
      },
    });
  }

  async update(id: string, teacherId: string, dto: UpdateStudentDto) {
    await this.findOne(id, teacherId); // ownership check
    return this.prisma.student.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, teacherId: string) {
    await this.findOne(id, teacherId); // ownership check
    return this.prisma.student.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async enroll(studentId: string, teacherId: string, batchId: string) {
    const student = await this.findOne(studentId, teacherId);

    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, teacherId, deletedAt: null },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    const existing = await this.prisma.enrollment.findFirst({
      where: { studentId: student.id, batchId, endedAt: null, deletedAt: null },
    });
    if (existing) throw new ConflictException('Student already enrolled in this batch');

    return this.prisma.enrollment.create({
      data: { studentId: student.id, batchId },
    });
  }

  async unenroll(studentId: string, teacherId: string, batchId: string) {
    const student = await this.findOne(studentId, teacherId);

    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId: student.id, batchId, endedAt: null, deletedAt: null },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    return this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { endedAt: new Date() },
    });
  }
}
