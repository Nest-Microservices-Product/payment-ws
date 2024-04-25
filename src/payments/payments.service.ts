import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/getEnvs';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/paymentSession.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);
  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items } = paymentSessionDto;
    const lineItems = items.map((item) => {
      return {
        price_data: {
          currency: currency,
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const session = await this.stripe.checkout.sessions.create({
      //in here we will put the orden id
      payment_intent_data: {},
      line_items: lineItems,
      mode: 'payment',
      success_url: 'http://localhost:3003/payments/success',
      cancel_url: 'http://localhost:3003/payments/cancelled',
    });
    return session;
  }

  async stripeWebhook(signature: string | string[], rawBody: any) {
    try {
      let event: Stripe.Event;
      const endpointSecret =
        'whsec_1f8a7d110228976caae81b3e913f4f5772d61f6146b950c59d34345db00026aa';
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        endpointSecret,
      );
    } catch (error) {
        throw new Error(error)
    }
  }
}
