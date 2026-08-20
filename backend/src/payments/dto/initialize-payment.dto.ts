import { IsNumber, IsString, Min } from 'class-validator';

export class InitializePaymentDto {
  @IsString()
  membershipId!: string;

  @IsNumber()
  @Min(1000)
  amount!: number;
}
