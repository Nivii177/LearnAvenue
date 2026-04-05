import { IsInt, Min, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class MarkPaidDto {
  /** Amount paid in LKR cents */
  @IsInt()
  @Min(1)
  amountPaid!: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @IsString()
  @IsOptional()
  notes?: string;
}
