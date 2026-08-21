import { Body, Controller, Post } from '@nestjs/common';
import { TrustLayerService } from './trust-layer.service.js';
import { VerifyRegistryDto } from './dto/verify-registry.dto.js';
import { Public } from '../common/decorators/public.decorator.js';

// Separate from TrustLayerController because this check is not scoped to an
// existing property — see docs/ARCHITECTURE.md §2.1 and TrustLayerService.verifyByRegistry.
@Controller('trust-layer')
export class TrustLayerVerifyController {
  constructor(private readonly trustLayerService: TrustLayerService) {}

  @Public()
  @Post('verify')
  async verify(@Body() dto: VerifyRegistryDto) {
    return { data: await this.trustLayerService.verifyByRegistry(dto) };
  }
}
