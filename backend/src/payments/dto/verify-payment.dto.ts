import { IsString } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  transactionId!: string;

  @IsString()
  txRef!: string;
}
