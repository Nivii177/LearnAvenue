import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  phone!: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  /** If provided, the student is immediately enrolled in this batch */
  @IsString()
  @IsOptional()
  batchId?: string;
}
