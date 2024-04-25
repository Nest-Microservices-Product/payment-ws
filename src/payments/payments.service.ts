import { Injectable } from '@nestjs/common';
import { envs } from 'src/config/getEnvs';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);
  async createPaymentSession() {
    const session = await this.stripe.checkout.sessions.create({
      //in here we will put the orden id
      payment_intent_data: {},
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'New order ',
            },
            unit_amount: 2000,
          },
          quantity: 3,
        },
      ],
      mode : 'payment',
      success_url : 'http://localhost:3003/payments/success',
      cancel_url : 'http://localhost:3003/payments/cancelled'
    });
    return session;
  }
}
