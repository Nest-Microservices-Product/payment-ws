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
      const endpointSecret = envs.endpointSecret;
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        endpointSecret,
      );
      switch (event.type) {
        case 'charge.succeeded':
          const chargeSucceeded = event.data.object;
          const receive_payment = event.data.object.receipt_url;
          // llamar nuestro microservicio
          console.log({
            metadata: chargeSucceeded.metadata,
            orderId: chargeSucceeded.metadata.orderId,
            receive_payment: receive_payment,
          });
          break;

        default:
          console.log(`Event ${event.type} not handled`);
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
