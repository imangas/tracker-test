import { InvalidAction, InvalidArea, InvalidDate } from '../../common/errors';
import { TrackerAction } from '../enums/action';
import { TrackerArea } from '../enums/area';

export class TrackerEvent {
  userId: number;
  area: TrackerArea;
  action: TrackerAction;
  date: Date;

  constructor(userId: number, area: string, action: string, date: string) {
    if (!TrackerEvent.isValidArea(area)) {
      throw new InvalidArea(area);
    }

    if (!TrackerEvent.isValidAction(action)) {
      throw new InvalidAction(action);
    }

    if (!TrackerEvent.isValidDate(date)) {
      throw new InvalidDate(date);
    }

    this.userId = userId;
    this.area = area;
    this.action = action;
    this.date = new Date(date);
  }

  static isValidArea = (value: any): value is TrackerArea => {
    return Object.values(TrackerArea).includes(value);
  };

  static isValidAction = (value: any): value is TrackerAction => {
    return Object.values(TrackerAction).includes(value);
  };

  static isValidDate = (date) => {
    var timestamp = Date.parse(date);
    return isNaN(timestamp) === false;
  };
}
