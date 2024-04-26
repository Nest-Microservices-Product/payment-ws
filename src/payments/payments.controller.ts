import {
  Controller,
  Get,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/paymentSession.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GetRawBody, GetSignature } from './decorators';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern({ cmd: 'create_payment_sesion' })
  createPaymentSession(@Payload() paymentSessionDto: PaymentSessionDto) {
    return this.paymentsService.createPaymentSession(paymentSessionDto);
  }

  @Get('success')
  success() {
    return {
      ok: true,
      message: 'Payment successful',
    };
  }

  @Get('cancelled')
  cancelled() {
    return {
      ok: false,
      message: 'Payment cancelled',
    };
  }

  @Post('webhook')
  async stripeWebHook(@GetSignature() signature, @GetRawBody() rawBody) {
    try {
      const stripeResponse = await this.paymentsService.stripeWebhook(
        signature,
        rawBody,
      );
      return stripeResponse;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
