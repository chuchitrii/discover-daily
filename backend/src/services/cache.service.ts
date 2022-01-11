import { Service } from 'fastify-decorators';
import NodeCache from 'node-cache';
import { FastifyReply, FastifyRequest } from 'fastify';
import { SpotifyApiService } from './spotify-api.service';

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

export interface IDependencyProvider {
  service?: CacheService;
  spotify?: SpotifyApiService;
}

export function cache<T extends (...args: [FastifyRequest, FastifyReply]) => Promise<any>>(dependencyProvider: IDependencyProvider) {
  return function(
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>
  ): void {
    if (!descriptor.value || !dependencyProvider?.service || !dependencyProvider?.spotify) return
    const originalFunc = descriptor.value;
    descriptor.value = function(...args: [FastifyRequest, FastifyReply]) {
      const resultFromCache = dependencyProvider.service?.getN(args[0].token.access_token, originalFunc.name);
      if (resultFromCache) {
        return resultFromCache;
      }
      return originalFunc.call(dependencyProvider, ...args).then((r) => {
        dependencyProvider.service?.setN(args[0].token.access_token, originalFunc.name, r);
        return r;
      });
    } as unknown as T
  }
}
