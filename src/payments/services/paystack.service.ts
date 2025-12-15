import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  PaystackSubscriptionResponse,
  VerifyPaymentDataResponse,
  VerifyPaystackPaymentResponse,
} from '../dto/paystack.dto';

const paystackApiUrl = 'https://api.paystack.co';
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

const headers = {
  Authorization: `Bearer ${paystackSecretKey}`,
  'Content-Type': 'application/json',
};
@Injectable()
export class PaystackService {
  constructor() {}

  // create subscription, handle payments, etc.
  async createSubscription(email: string, planCode: string) {
    const { data } = await axios
      .post<PaystackSubscriptionResponse>(
        `${paystackApiUrl}/subscription`,
        {
          customer: email,
          plan: planCode,
        },
        { headers },
      )
      .catch((error) => {
        throw new BadRequestException(error?.response?.data);
      });

    if (!data.status) {
      throw new BadRequestException('Subscription creation failed');
    }

    return data;
  }

  // enable subscription
  async enableSubscriptionAutoRenewal(
    subscriptionCode: string,
    emailToken: string,
  ) {
    const { data } = await axios
      .post(
        `${paystackApiUrl}/subscription/enable`,
        {
          code: subscriptionCode,
          token: emailToken,
        },
        { headers },
      )
      .catch((error) => {
        throw new BadRequestException(error?.response?.data);
      });

    if (!data.status) {
      throw new BadRequestException(
        'Enabling subscription auto-renewal failed',
      );
    }

    return data;
  }

  // disable subscription autorenewal
  async disableSubscriptionAutoRenewal(
    subscriptionCode: string,
    emailToken: string,
  ) {
    const { data } = await axios
      .post(
        `${paystackApiUrl}/subscription/disable`,
        {
          code: subscriptionCode,
          token: emailToken,
        },
        { headers },
      )
      .catch((error) => {
        throw new BadRequestException(error?.response?.data);
      });

    return data;
  }

  // Verify payment
  async verifyPayment(reference: string): Promise<VerifyPaymentDataResponse> {
    const { data } = await axios
      .get<VerifyPaystackPaymentResponse>(
        `${paystackApiUrl}/transaction/verify/${reference}`,
        {
          headers,
        },
      )
      .catch((error) => {
        throw new BadRequestException(error?.response?.data);
      });

    if (!data.status) {
      throw new BadRequestException('Payment verification failed');
    }

    return data.data;
  }

  // handle paystack webhook
}
