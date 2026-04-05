import { IsString, IsInt, Min, IsOptional, MinLength } from 'class-validator';

export class UpdateBatchDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  monthlyFee?: number;

  @IsString()
  @IsOptional()
  schedule?: string;
}
