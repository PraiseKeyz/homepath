import { IsString } from 'class-validator';

export class ProposeRentToOwnMatchDto {
  @IsString()
  propertyId!: string;
}
