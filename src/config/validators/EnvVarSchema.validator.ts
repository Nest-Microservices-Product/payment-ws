import * as joi from 'joi';
import { EnvVars } from '../entities/EnvVars.entity';

export const envSchema = joi
  .object<EnvVars>({
    PORT: joi.number().required(),
    STRIPE_SECRET: joi.string().required(),
    ENDPOINT_SECRET : joi.string().required()
  })
  .unknown(true);
