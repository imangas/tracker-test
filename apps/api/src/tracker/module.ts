import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongooseModule } from '@nestjs/mongoose';

import { TrackerController } from './application/controllers/controller';
import { TrackerService } from './domain/services/service';
import {
  EventRepository,
  NotificationRepository,
  TrackerEventMongo,
  TrackerEventMongoSchema,
  TrackerNotificationMongo,
  TrackerNotificationMongoSchema,
} from './infrastructure/mongodb';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        { name: TrackerEventMongo.name, schema: TrackerEventMongoSchema },
        {
          name: TrackerNotificationMongo.name,
          schema: TrackerNotificationMongoSchema,
        },
      ],
      'tracker-api',
    ),
    EventEmitterModule.forRoot(),
  ],
  controllers: [TrackerController],
  providers: [
    TrackerService,
    ConfigService,
    {
      provide: 'EventRepository',
      useClass: EventRepository,
    },
    {
      provide: 'NotificationRepository',
      useClass: NotificationRepository,
    },
  ],
  exports: [TrackerService, ConfigService],
})
export class TrackerModule {}
