import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  FlutterwaveService,
  type FlutterwaveInitResponse,
} from './flutterwave.service.js';
import type { SafeUser } from '../common/constants/safe-user.constant.js';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly frontendUrl: string;
  private readonly paymentInclude = {
    membership: { include: { cooperative: true } },
    contribution: true,
  } as const;

  constructor(
    private readonly prisma: PrismaService,
    private readonly flutterwave: FlutterwaveService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  }

  async initializeContribution(user: SafeUser, membershipId: string, amount: number) {
    // Verify the membership belongs to this user
    const membership = await this.prisma.cooperativeMembership.findUnique({
      where: { id: membershipId },
      include: { cooperative: true },
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }
    if (membership.userId !== user.id) {
      throw new ForbiddenException(
        'You can only make payments for your own memberships',
      );
    }

    const txRef = `HP-${user.id.slice(-6)}-${Date.now()}`;

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId: user.id,
        membershipId,
        amount,
        txRef,
        currency: 'NGN',
      },
    });

    // Call Flutterwave to get checkout URL
    let flwResponse: FlutterwaveInitResponse;
    try {
      flwResponse = await this.flutterwave.initializePayment({
        tx_ref: txRef,
        amount,
        currency: 'NGN',
        redirect_url: `${this.frontendUrl}/dashboard/payments/callback`,
        customer: {
          email: user.email,
          name: user.name,
          phonenumber: user.phone ?? undefined,
        },
        customizations: {
          title: 'HomePath Savings',
          description: `Monthly contribution to ${membership.cooperative.name}`,
        },
        payment_options: 'card,banktransfer,ussd',
      });
    } catch (error) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
      throw error;
    }

    // Update payment record with checkout URL
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { checkoutUrl: flwResponse.data.link },
    });

    return {
      paymentId: payment.id,
      checkoutUrl: flwResponse.data.link,
      txRef,
    };
  }

  async verifyAndFulfill(transactionId: string, txRef: string, userId?: string) {
    // Find the payment record
    const payment = await this.prisma.payment.findUnique({
      where: { txRef },
      include: this.paymentInclude,
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this transaction reference');
    }
    if (userId && payment.userId !== userId) {
      throw new ForbiddenException('You can only verify your own payments');
    }

    // Already processed
    if (payment.status === 'SUCCESS') {
      return payment;
    }
    if (payment.status === 'CANCELLED') {
      throw new BadRequestException('This payment has already been cancelled');
    }
    if (payment.status === 'FAILED') {
      throw new BadRequestException('This payment has already failed');
    }

    // Verify with Flutterwave
    const flwResponse = await this.flutterwave.verifyTransaction(transactionId);
    const txData = flwResponse.data;

    // Validate the transaction
    if (
      txData.status !== 'successful' ||
      txData.tx_ref !== txRef ||
      txData.amount < Number(payment.amount) ||
      txData.currency !== payment.currency
    ) {
      await this.prisma.payment.updateMany({
        where: { id: payment.id, status: 'PENDING' },
        data: {
          status: 'FAILED',
          providerTxId: String(txData.id),
        },
      });
      throw new BadRequestException(
        `Payment verification failed: status=${txData.status}, amount=${txData.amount}, currency=${txData.currency}`,
      );
    }

    // Create the contribution and update payment atomically
    const now = new Date();
    const contributionMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await this.prisma.$transaction(async (tx) => {
      const claimed = await tx.payment.updateMany({
        where: { id: payment.id, status: 'PENDING' },
        data: {
          status: 'SUCCESS',
          providerTxId: String(txData.id),
        },
      });

      if (claimed.count === 0) {
        const existing = await tx.payment.findUnique({
          where: { id: payment.id },
          include: this.paymentInclude,
        });
        if (!existing) throw new NotFoundException('Payment not found');
        return existing;
      }

      const contribution = await tx.contribution.create({
        data: {
          membershipId: payment.membershipId,
          amount: payment.amount,
          month: contributionMonth,
        },
      });

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          contributionId: contribution.id,
        },
        include: this.paymentInclude,
      });

      return updatedPayment;
    });

    this.logger.log(
      `Payment ${payment.id} verified and fulfilled — Contribution created for ${payment.membership.cooperative.name}`,
    );

    return result;
  }

  async handleWebhook(payload: any, signature: string | undefined) {
    const webhookHash = this.configService.get<string>('FLW_WEBHOOK_HASH');

    if (!webhookHash || signature !== webhookHash) {
      this.logger.warn('Invalid webhook signature received');
      throw new ForbiddenException('Invalid webhook signature');
    }

    if (payload?.event === 'charge.completed' && payload?.data?.status === 'successful') {
      const txRef = payload.data.tx_ref;
      const transactionId = String(payload.data.id);

      try {
        await this.verifyAndFulfill(transactionId, txRef);
      } catch (error) {
        const stack = error instanceof Error ? error.stack : String(error);
        this.logger.error(`Webhook fulfillment failed for tx_ref=${txRef}`, stack);
      }
    }
  }

  async findUserPayments(userId: string) {
    return this.prisma.payment.findMany({
      where: { userId },
      include: this.paymentInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async cancelPayment(userId: string, txRef: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { txRef },
      include: this.paymentInclude,
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this transaction reference');
    }
    if (payment.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own payments');
    }
    if (payment.status !== 'PENDING') {
      return payment;
    }

    return this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'CANCELLED' },
      include: this.paymentInclude,
    });
  }
}
