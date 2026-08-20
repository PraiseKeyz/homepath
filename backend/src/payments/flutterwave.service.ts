import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface FlutterwaveInitPayload {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  customer: {
    email: string;
    name: string;
    phonenumber?: string;
  };
  customizations: {
    title: string;
    description: string;
  };
  payment_options?: string;
}

export interface FlutterwaveInitResponse {
  status: string;
  message: string;
  data: {
    link: string;
  };
}

export interface FlutterwaveVerifyResponse {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    charged_amount: number;
    status: string;
    payment_type: string;
    customer: {
      email: string;
      name: string;
    };
    created_at: string;
  };
}

@Injectable()
export class FlutterwaveService {
  private readonly logger = new Logger(FlutterwaveService.name);
  private readonly baseUrl = 'https://api.flutterwave.com/v3';
  private readonly secretKey: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('FLW_SECRET_KEY') ?? '';
  }

  async initializePayment(
    payload: FlutterwaveInitPayload,
  ): Promise<FlutterwaveInitResponse> {
    const res = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = (await res.json()) as FlutterwaveInitResponse;

    if (!res.ok || body.status !== 'success') {
      this.logger.error(
        `Flutterwave init failed: ${body.message}`,
        JSON.stringify(body),
      );
      throw new Error(`Flutterwave initialization failed: ${body.message}`);
    }

    return body;
  }

  async verifyTransaction(
    transactionId: string,
  ): Promise<FlutterwaveVerifyResponse> {
    const res = await fetch(
      `${this.baseUrl}/transactions/${transactionId}/verify`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const body = (await res.json()) as FlutterwaveVerifyResponse;

    if (!res.ok || body.status !== 'success') {
      this.logger.error(
        `Flutterwave verify failed: ${body.message}`,
        JSON.stringify(body),
      );
      throw new Error(`Flutterwave verification failed: ${body.message}`);
    }

    return body;
  }
}
