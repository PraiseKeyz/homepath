import { IsString, MinLength } from 'class-validator';

export class VerifyRegistryDto {
  @IsString()
  @MinLength(1)
  plotNumber!: string;

  @IsString()
  @MinLength(1)
  surveyNumber!: string;
}
