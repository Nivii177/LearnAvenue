import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateStudentDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;
}
