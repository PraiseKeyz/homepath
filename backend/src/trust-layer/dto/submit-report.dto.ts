import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CommunityReportType } from '../../../generated/prisma/index.js';

export class SubmitReportDto {
  @IsEnum(CommunityReportType)
  type!: CommunityReportType;

  @IsOptional()
  @IsString()
  description?: string;
}
