import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from './sms.service';
import { MarkPaidDto } from './dto/mark-paid.dto';

/** Returns the first millisecond of the given month in UTC */
function monthKey(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1));
}

function currentMonthKey(): Date {
  const now = new Date();
  return monthKey(now.getUTCFullYear(), now.getUTCMonth());
}

@Injectable()
export class FeeService {
  constructor(
    private prisma: PrismaService,
    private sms: SmsService,
  ) {}

  // ─── Ledger ───────────────────────────────────────────────────────────────

  /**
   * Full fee ledger for a batch in a given month.
   * month param: YYYY-MM (e.g. "2025-04")
   */
  async getLedger(teacherId: string, batchId: string, month: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, deletedAt: null },
    });
    if (!batch) throw new NotFoundException('Batch not found');
    if (batch.teacherId !== teacherId) throw new ForbiddenException();

    const [year, mon] = month.split('-').map(Number) as [number, number];
    const monthDate = monthKey(year, mon - 1); // JS months are 0-indexed

    const records = await this.prisma.feeRecord.findMany({
      where: { batchId, month: monthDate, deletedAt: null },
      include: {
        student: {
          select: { id: true, name: true, phone: true, parentPhone: true },
        },
      },
      orderBy: { student: { name: 'asc' } },
    });

    const totalDue = records.reduce((s, r) => s + r.amountDue, 0);
    const totalPaid = records.reduce((s, r) => s + r.amountPaid, 0);
    const overdueCount = records.filter((r) => r.amountPaid < r.amountDue).length;
    const paidCount = records.filter((r) => r.amountPaid >= r.amountDue).length;

    return { batchId, month, totalDue, totalPaid, overdueCount, paidCount, records };
  }

  /** All fee records across all batches where amount is still owed this month */
  async getOverdue(teacherId: string) {
    const monthDate = currentMonthKey();

    // Prisma doesn't support column-to-column comparisons in where clauses,
    // so fetch all current-month records and filter amountPaid < amountDue in JS.
    const records = await this.prisma.feeRecord.findMany({
      where: {
        deletedAt: null,
        batch: { teacherId, deletedAt: null },
        month: monthDate,
      },
      include: {
        student: { select: { id: true, name: true, phone: true, parentPhone: true } },
        batch: { select: { id: true, name: true } },
      },
      orderBy: { student: { name: 'asc' } },
    });

    return records.filter((r) => r.amountPaid < r.amountDue);
  }

  // ─── Generate ─────────────────────────────────────────────────────────────

  /**
   * Create FeeRecord rows for the current month for every student with an
   * active enrollment in the teacher's batches.
   * Idempotent — skips records that already exist (@@unique constraint).
   */
  async generateForCurrentMonth(teacherId: string, batchId?: string) {
    const monthDate = currentMonthKey();

    const batches = await this.prisma.batch.findMany({
      where: {
        teacherId,
        deletedAt: null,
        ...(batchId ? { id: batchId } : {}),
      },
      include: {
        enrollments: {
          where: { endedAt: null, deletedAt: null },
          select: { studentId: true },
        },
      },
    });

    const toCreate: { studentId: string; batchId: string; month: Date; amountDue: number }[] = [];

    for (const batch of batches) {
      for (const enrollment of batch.enrollments) {
        toCreate.push({
          studentId: enrollment.studentId,
          batchId: batch.id,
          month: monthDate,
          amountDue: batch.monthlyFee,
        });
      }
    }

    // createMany with skipDuplicates is safe here — unique constraint is (studentId, batchId, month)
    const result = await this.prisma.feeRecord.createMany({
      data: toCreate,
      skipDuplicates: true,
    });

    return { created: result.count, total: toCreate.length };
  }

  // ─── Mark Paid ────────────────────────────────────────────────────────────

  async markPaid(id: string, teacherId: string, dto: MarkPaidDto) {
    const record = await this.findOwnedRecord(id, teacherId);

    if (record.deletedAt) throw new BadRequestException('Record is deleted');

    return this.prisma.feeRecord.update({
      where: { id },
      data: {
        amountPaid: dto.amountPaid,
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
        paidAt: new Date(),
      },
    });
  }

  // ─── SMS Reminder ─────────────────────────────────────────────────────────

  async sendReminder(id: string, teacherId: string) {
    const record = await this.findOwnedRecord(id, teacherId);

    if (record.amountPaid >= record.amountDue) {
      throw new BadRequestException('Fee is already paid — no reminder needed');
    }

    // Prefer parentPhone, fall back to student's own phone
    const student = await this.prisma.student.findUniqueOrThrow({
      where: { id: record.studentId },
      select: { name: true, phone: true, parentPhone: true },
    });

    const to = student.parentPhone ?? student.phone;
    const owing = record.amountDue - record.amountPaid;
    const monthLabel = record.month.toLocaleDateString('en-LK', {
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Colombo',
    });

    const message =
      `Dear ${student.name}'s parent, ` +
      `your tuition fee of Rs. ${(owing / 100).toLocaleString('en-LK')} ` +
      `for ${monthLabel} is outstanding. ` +
      `Please settle at your earliest convenience. - Panthi`;

    await this.sms.send(to, message);

    return this.prisma.feeRecord.update({
      where: { id },
      data: { reminderSentAt: new Date() },
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async findOwnedRecord(id: string, teacherId: string) {
    const record = await this.prisma.feeRecord.findFirst({
      where: { id, deletedAt: null },
      include: { batch: { select: { teacherId: true } } },
    });
    if (!record) throw new NotFoundException('Fee record not found');
    if (record.batch.teacherId !== teacherId) throw new ForbiddenException();
    return record;
  }
}
