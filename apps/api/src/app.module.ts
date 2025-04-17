import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { TrackerModule } from './tracker/module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      connectionName: 'tracker-api',
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ ignoreEnvFile: true }),
    TrackerModule,
  ],
  controllers: [],
  providers: [TrackerModule],
  exports: [],
})
export class AppModule {}
