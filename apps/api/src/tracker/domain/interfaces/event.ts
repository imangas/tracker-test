import { TrackerAction } from '../enums/action';
import { TrackerArea } from '../enums/area';

export interface TrackerEventInterface {
  userId: number;
  area: TrackerArea;
  action: TrackerAction;
  date: Date;
}
