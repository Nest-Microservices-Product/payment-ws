export interface EnvVars {
  PORT: number;
  STRIPE_SECRET : string;
  ENDPOINT_SECRET : string;
  STRIPE_SUCCESS_URL : string;
  STRIPE_CANCEL_URL : string;
  NATS_SERVERS : string;
}
