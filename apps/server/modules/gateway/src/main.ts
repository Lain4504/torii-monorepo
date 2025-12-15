import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(process.env.port ?? 8080);
}
bootstrap();
