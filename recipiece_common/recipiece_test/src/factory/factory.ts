export abstract class Factory<T extends any> {
  public abstract generate (body?: Partial<T>): IterableIterator<T>;
}
