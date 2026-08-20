import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
} from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { InitializePaymentDto } from './dto/initialize-payment.dto.js';
import { VerifyPaymentDto } from './dto/verify-payment.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import type { SafeUser } from '../common/constants/safe-user.constant.js';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  async initialize(
    @CurrentUser() user: SafeUser,
    @Body() dto: InitializePaymentDto,
  ) {
    return {
      data: await this.paymentsService.initializeContribution(
        user,
        dto.membershipId,
        dto.amount,
      ),
    };
  }

  @Post('verify')
  async verify(
    @CurrentUser() user: SafeUser,
    @Body() dto: VerifyPaymentDto,
  ) {
    return {
      data: await this.paymentsService.verifyAndFulfill(
        dto.transactionId,
        dto.txRef,
      ),
    };
  }

  @Public()
  @Post('webhook')
  async webhook(
    @Body() payload: any,
    @Headers('verif-hash') signature: string | undefined,
  ) {
    await this.paymentsService.handleWebhook(payload, signature);
    return { data: null, message: 'Webhook received' };
  }

  @Get('history')
  async history(@CurrentUser() user: SafeUser) {
    return {
      data: await this.paymentsService.findUserPayments(user.id),
    };
  }
}
