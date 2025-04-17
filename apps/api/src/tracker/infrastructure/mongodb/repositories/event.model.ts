// src/domain/models/event.model.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { TrackerAction } from '../../../domain/enums/action';
import { TrackerArea } from '../../../domain/enums/area';
import { TrackerEventInterface } from '../../../domain/interfaces/event';

@Schema({ collection: 'tracker_events' })
export class TrackerEventMongo implements TrackerEventInterface {
  @Prop({ required: true })
  userId: number;

  @Prop({ required: true })
  area: TrackerArea;

  @Prop({ required: true })
  action: TrackerAction;

  @Prop({ required: true })
  date: Date;
}

export type TrackerEventMongoDocument = TrackerEventMongo & Document;
export const TrackerEventMongoSchema =
  SchemaFactory.createForClass(TrackerEventMongo);
