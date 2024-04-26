import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const GetRawBody = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    if (!req['rawBody']) {
      throw new InternalServerErrorException('Raw body not found in request');
    }
    return req['rawBody'];
  },
);
