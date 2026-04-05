import { IsString } from 'class-validator';

export class EnrollDto {
  @IsString()
  batchId!: string;
}
