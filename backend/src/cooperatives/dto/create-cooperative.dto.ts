import { IsString } from 'class-validator';

export class CreateCooperativeDto {
  @IsString()
  name!: string;

  @IsString()
  targetAreaKey!: string;

  @IsString()
  targetPropertyType!: string;
}
