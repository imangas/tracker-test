import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'test-producer',
        brokers: configService.get('KAFKA_BROKERS').split(',') || undefined,
        replicationFactor: 1,
      },
      consumer: {
        groupId: 'test-consumer',
        replicationFactor: 1,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
