import { TrackerLimitType } from '../enums/limit_type';

export interface TrackerNotificationInterface {
  userId: number;
  limitType: TrackerLimitType;
  date: Date;
}
