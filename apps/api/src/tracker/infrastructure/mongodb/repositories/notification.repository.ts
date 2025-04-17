import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  TrackerNotificationMongo,
  TrackerNotificationMongoDocument,
} from './notification.model';

@Injectable()
export class NotificationRepository implements NotificationRepository {
  constructor(
    @InjectModel(TrackerNotificationMongo.name, 'tracker-api')
    private notificationModel: Model<TrackerNotificationMongoDocument>,
  ) {}
  async persist(
    notificationData: Partial<TrackerNotificationMongo>,
  ): Promise<TrackerNotificationMongoDocument> {
    const newNotification = new this.notificationModel(notificationData);
    return newNotification.save();
  }

  async fetchById(
    id: string,
  ): Promise<TrackerNotificationMongoDocument | null> {
    return this.notificationModel.findById(id).exec();
  }
}
