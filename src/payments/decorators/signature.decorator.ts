import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const GetSignature = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    if (!req.headers['stripe-signature']) {
      throw new InternalServerErrorException(
        'Stripe signature not found in headers request',
      );
    }
    return req.headers['stripe-signature'];
  },
);
