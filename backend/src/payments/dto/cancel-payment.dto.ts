import { IsString } from 'class-validator';

export class CancelPaymentDto {
  @IsString()
  txRef!: string;
}
