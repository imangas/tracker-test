// src/domain/models/event.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { TrackerLimitType } from '../../../domain/enums/limit_type';
import { TrackerNotificationInterface } from '../../../domain/interfaces/notification';

@Schema({ collection: 'tracker_notifications' })
export class TrackerNotificationMongo implements TrackerNotificationInterface {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  limitType: TrackerLimitType;

  @Prop({ required: true })
  date: Date;
}

export type TrackerNotificationMongoDocument = TrackerNotificationMongo &
  Document;
export const TrackerNotificationMongoSchema = SchemaFactory.createForClass(
  TrackerNotificationMongo,
);
