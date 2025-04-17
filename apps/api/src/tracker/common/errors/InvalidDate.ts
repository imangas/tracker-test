export class InvalidDate extends Error {
  constructor(public value: string) {
    super(`${value} is not a valid Date`);
    this.name = 'InvalidDate';
    this.stack = (<any>new Error()).stack;
  }
}
