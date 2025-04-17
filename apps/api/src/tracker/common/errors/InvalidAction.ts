import { TrackerAction } from '../../domain/enums/action';

export class InvalidAction extends Error {
  constructor(public value: string) {
    super(`${value} is not a valid Action (${Object.values(TrackerAction)})`);
    this.name = 'InvalidAction';
    this.stack = (<any>new Error()).stack;
  }
}
