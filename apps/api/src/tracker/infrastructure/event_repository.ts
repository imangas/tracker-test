import { BasicRepository } from './basic_repository';

export abstract class EventRepository extends BasicRepository {
  abstract getTotalDeletionsByUserId(data): Promise<number>;
  abstract getTotalUpatesInLastMinuteByUserId(data): Promise<number>;
  abstract checkIfSecretReadByUserId(data): Promise<boolean>;
}
