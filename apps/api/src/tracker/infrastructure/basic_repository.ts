export abstract class BasicRepository {
  abstract persist(data): Promise<any>;
  abstract fetchById(id: string): Promise<any>;
}
