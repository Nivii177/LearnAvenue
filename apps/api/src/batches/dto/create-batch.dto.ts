import { IsString, IsInt, Min, IsOptional, MinLength } from 'class-validator';

export class CreateBatchDto {
  @IsString()
  @MinLength(2)
  name!: string;

  /** Monthly fee in LKR cents. e.g. 250000 = Rs. 2,500 */
  @IsInt()
  @Min(0)
  monthlyFee!: number;

  @IsString()
  @IsOptional()
  schedule?: string;
}
