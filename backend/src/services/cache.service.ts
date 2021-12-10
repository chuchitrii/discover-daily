import { Service } from 'fastify-decorators';
import NodeCache from 'node-cache';

@Service()
export class CacheService {
  public client: NodeCache = new NodeCache()
}
