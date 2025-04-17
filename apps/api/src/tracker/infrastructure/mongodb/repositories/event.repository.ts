import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TrackerAction } from '../../../domain/enums/action';
import { TrackerArea } from '../../../domain/enums/area';
import { TrackerEventMongo, TrackerEventMongoDocument } from './event.model';

@Injectable()
export class EventRepository implements EventRepository {
  constructor(
    @InjectModel(TrackerEventMongo.name, 'tracker-api')
    private eventModel: Model<TrackerEventMongoDocument>,
  ) {}
  async persist(
    eventData: Partial<TrackerEventMongo>,
  ): Promise<TrackerEventMongoDocument> {
    const newEvent = new this.eventModel(eventData);
    return newEvent.save();
  }

  async fetchById(id: string): Promise<TrackerEventMongoDocument | null> {
    return this.eventModel.findById(id).exec();
  }

  async getTotalDeletionsByUserId(userId: string): Promise<any> {
    return this.eventModel
      .countDocuments({
        action: TrackerAction.DELETE,
        userId,
      })
      .exec();
  }

  async getTotalUpatesInLastMinuteByUserId(userId: string): Promise<any> {
    return this.eventModel
      .countDocuments({
        area: TrackerArea.USER,
        action: TrackerAction.UPDATE,
        userId,
        date: { $gte: new Date(Date.now() - 60 * 1000) },
      })
      .exec();
  }

  async checkIfSecretReadByUserId(userId: string): Promise<boolean> {
    const exists = await this.eventModel
      .exists({
        area: TrackerArea.TOP_SECRET,
        action: TrackerAction.READ,
        userId,
      })
      .exec();

    return exists !== null;
  }
}
