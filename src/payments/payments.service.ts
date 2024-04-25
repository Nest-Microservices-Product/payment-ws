import { Inject, Injectable } from '@nestjs/common';
import { envs } from 'src/config/getEnvs';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/paymentSession.dto';
import { ClientProxy } from '@nestjs/microservices';
import { NAST_SERVICE } from 'src/shared/constants/NATS_SERVICE';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecret);
  constructor(
    @Inject(NAST_SERVICE) private readonly client: ClientProxy
  ) {}
  async createPaymentSession(paymentSessionDto: PaymentSessionDto) {
    const { currency, items, orderId } = paymentSessionDto;
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
      //in here we will put the order id
      payment_intent_data: {
        metadata: {
          orderId: orderId,
        },
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,
    });
    return session;
  }

  async stripeWebhook(signature: string | string[], rawBody: any) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        envs.endpointSecret,
      );
      if (event.type === 'charge.succeeded') {
        const chargeSucceeded = event.data.object;
        // we will call our microservice soon
        console.log({
          metadata: chargeSucceeded.metadata,
          orderId: chargeSucceeded.metadata.orderId,
          receive_payment: chargeSucceeded.receipt_url,
        });
      } else {
        console.log(`Event ${event.type} not handled`);
      }
    } catch (error) {
      throw new Error(error);
    }
  }
}
