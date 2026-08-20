import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service.js';
import { PaymentsController } from './payments.controller.js';
import { FlutterwaveService } from './flutterwave.service.js';

@Module({
  providers: [PaymentsService, FlutterwaveService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
