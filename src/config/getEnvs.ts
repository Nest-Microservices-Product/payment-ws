import 'dotenv/config';
import { envSchema } from './validators/EnvVarSchema.validator';
import { EnvVars } from './entities/EnvVars.entity';

const getEnvVars = () => {
  const { error, value } = envSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env?.NATS_SERVERS.split(','),
  });

  if (error) {
    throw new Error(
      `There was an error with the config validation ${error.message}`,
    );
  }

  const envVars: EnvVars = value;

  return {
    port: envVars.PORT,
    stripeSecret: envVars.STRIPE_SECRET,
    endpointSecret: envVars.ENDPOINT_SECRET,
    stripeSuccessUrl: envVars.STRIPE_SUCCESS_URL,
    stripeCancelUrl: envVars.STRIPE_CANCEL_URL,
    natsServer: envVars.NATS_SERVERS,
  };
};

export const envs = getEnvVars();
