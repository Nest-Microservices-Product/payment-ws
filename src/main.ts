import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envs } from './config/getEnvs';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create(AppModule, { rawBody: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(envs.port);
  logger.log(`Payments server started on port ${envs.port}`);
}
bootstrap();
