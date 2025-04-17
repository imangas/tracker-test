import { InvalidDate } from '../../common/errors';
import { TrackerLimitType } from '../enums/limit_type';
import { TrackerNotificationInterface } from '../interfaces/notification';

export class TrackerNotification implements TrackerNotificationInterface {
  userId: number;
  date: Date;
  limitType: TrackerLimitType;

  constructor(userId: number, date: string, limitType: TrackerLimitType) {
    if (!TrackerNotification.isValidDate(date)) {
      throw new InvalidDate(date);
    }

    this.userId = userId;
    this.date = new Date(date);
    this.limitType = limitType;
  }

  static isValidLimitType = (value: any): value is TrackerLimitType => {
    return Object.values(TrackerLimitType).includes(value);
  };

  static isValidDate = (date) => {
    var timestamp = Date.parse(date);
    return isNaN(timestamp) === false;
  };
}
