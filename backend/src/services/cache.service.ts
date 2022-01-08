import { Service } from 'fastify-decorators';
import NodeCache from 'node-cache';

@Service()
export class CacheService extends NodeCache{
  constructor() {
    super({
      stdTTL: 3600,
    });
  }

  setN<T>(level1: string, level2: string, value: T): boolean {
    return this.set<T>(`${level1}${level2}`, value)
  }

  getN<T>(level1: string, level2: string): T | undefined {
    return this.get<T>(`${level1}${level2}`)
  }

  keysN(level1: string): string[] {
    return this.keys().filter(key => key.startsWith(level1));
  }

  delN(level1: string): number {
    return this.del(this.keysN(level1))
  }
}
