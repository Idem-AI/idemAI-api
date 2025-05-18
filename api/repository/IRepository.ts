export interface IRepository<T extends { id?: string; createdAt?: Date; updatedAt?: Date }> {
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>, userId?: string): Promise<T>; // userId for user-specific collections
  findById(id: string, userId?: string): Promise<T | null>;
  findAll(userId?: string): Promise<T[]>;
  update(id: string, item: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>, userId?: string): Promise<T | null>;
  delete(id: string, userId?: string): Promise<boolean>;
}
