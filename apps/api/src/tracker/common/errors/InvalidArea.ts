import { TrackerArea } from '../../domain/enums/area';

export class InvalidArea extends Error {
  constructor(public value: string) {
    super(`${value} is not a valid Area (${Object.values(TrackerArea)})`);
    this.name = 'InvalidArea';
    this.stack = (<any>new Error()).stack;
  }
}
