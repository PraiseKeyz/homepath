import { Body, Controller, Param, Post } from '@nestjs/common';
import { TrustLayerService } from './trust-layer.service.js';
import { SubmitDocumentDto } from './dto/submit-document.dto.js';
import { SubmitReportDto } from './dto/submit-report.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { SafeUser } from '../common/constants/safe-user.constant.js';

@Controller('properties/:propertyId')
export class TrustLayerController {
  constructor(private readonly trustLayerService: TrustLayerService) {}

  @Post('documents')
  async submitDocument(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: SubmitDocumentDto,
  ) {
    return {
      data: await this.trustLayerService.submitDocument(
        propertyId,
        user.id,
        dto,
      ),
    };
  }

  @Post('reports')
  async submitReport(
    @Param('propertyId') propertyId: string,
    @CurrentUser() user: SafeUser,
    @Body() dto: SubmitReportDto,
  ) {
    return {
      data: await this.trustLayerService.submitReport(propertyId, user.id, dto),
    };
  }

  @Public()
  @Post('trust-score')
  async computeTrustScore(@Param('propertyId') propertyId: string) {
    return { data: await this.trustLayerService.computeTrustScore(propertyId) };
  }
}
