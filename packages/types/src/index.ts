// ─── Enums ──────────────────────────────────────────────────────────────────

export type PaymentMethod = 'cash' | 'online' | 'waived';

// ─── Teacher ─────────────────────────────────────────────────────────────────

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string; // ISO-8601 UTC
  updatedAt: string;
}

// ─── Batch ───────────────────────────────────────────────────────────────────

export interface Batch {
  id: string;
  name: string;
  teacherId: string;
  /** Monthly fee in LKR cents (e.g. 250000 = Rs. 2,500) */
  monthlyFee: number;
  schedule: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Student ─────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  name: string;
  phone: string;
  parentPhone: string | null;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  batchId: string;
  startedAt: string;
  endedAt: string | null;
}

// ─── Fee ─────────────────────────────────────────────────────────────────────

export interface FeeRecord {
  id: string;
  studentId: string;
  batchId: string;
  /** ISO-8601 date of the first day of the month (UTC) */
  month: string;
  /** Amount owed in LKR cents */
  amountDue: number;
  /** Amount received in LKR cents */
  amountPaid: number;
  paidAt: string | null;
  paymentMethod: PaymentMethod | null;
  notes: string | null;
  reminderSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── API DTOs ─────────────────────────────────────────────────────────────────

export interface FeeRecordWithStudent extends FeeRecord {
  student: Pick<Student, 'id' | 'name' | 'phone' | 'parentPhone'>;
}

export interface BatchFeeOverview {
  batchId: string;
  month: string;
  totalDue: number;
  totalPaid: number;
  overdueCount: number;
  paidCount: number;
  records: FeeRecordWithStudent[];
}

export interface MarkPaidDto {
  amountPaid: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface TeacherLoginDto {
  email: string;
  password: string;
}

export interface TeacherRegisterDto {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  teacher: Teacher;
}

// ─── SMS ─────────────────────────────────────────────────────────────────────

export interface SmsReminder {
  feeRecordId: string;
  sentAt: string;
  to: string; // phone number used
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
