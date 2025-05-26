import { Inject, Injectable, Logger } from '@nestjs/common';
import { envs } from 'src/config/getEnvs';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/paymentSession.dto';
import { ClientProxy } from '@nestjs/microservices';
import { NAST_SERVICE } from 'src/shared/constants/NATS_SERVICE';
import { ORDERS_SERVICES_NAMES } from 'src/shared/entities/OrdersServicesNames';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('PaymentsService');
  private readonly stripe = new Stripe(envs.stripeSecret);
  constructor(@Inject(NAST_SERVICE) private readonly client: ClientProxy) {}
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

    const resSession = {
      cancelUrl: session.cancel_url,
      successUrl: session.success_url,
      url: session.url,
    };
    return resSession;
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
        const payload = {
          stripePaymentId: chargeSucceeded.id,
          orderId: chargeSucceeded.metadata.orderId,
          receive_payment: chargeSucceeded.receipt_url,
        };
        this.client.emit(ORDERS_SERVICES_NAMES.PAYMENT_SUCCEDED, payload);
      } else {
        console.log(`Event ${event.type} not handled`);
      }
    } catch (error) {
      this.logger.error('Error processing Stripe webhook', error);
      this.logger.error(`Error message: ${error.message}`);
      throw new Error(error);
    }
  }
}
