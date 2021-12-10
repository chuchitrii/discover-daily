import { FastifyInstanceToken, getInstanceByToken, Service } from 'fastify-decorators';
import SpotifyWebApi from 'spotify-web-api-node';
import { ErrorWithStatus } from '../models/error.model';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SharedService } from './shared.service';
import { cookieOptions } from '../models/cookie-options.model';

interface SpotifyApiResponse<T = any> {
  headers: Record<string, string>;
  body: T;
  statusCode: number
}
type UnPromise<T extends Promise<any>> = T extends Promise<infer U> ? U : never;
type UnResponse<T extends {body: any}> = T extends {body: infer U} ? U : never;
type UnPage<T extends {items: any[]}> = T extends {items: (infer U)[]} ? U : never;
@Service()
export class SpotifyApiService extends SpotifyWebApi{
  private fastify: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  constructor(private sharedService: SharedService) {
    super();
  }

  public execAndHandle<FunctionType extends { (...p: any): any }>(request: FastifyRequest, reply: FastifyReply, func: FunctionType, ...args: Parameters<FunctionType>): ReturnType<FunctionType> {
    return func.bind(this, ...args)()
      .catch((error: SpotifyApiResponse) => {
        return this.handleErrors(error, request, reply, func, ...args)
      })
  }

  public getAllItemsFromListOfUnknownLength<T extends any, FunctionType extends { (...args: any[]): Promise<SpotifyApiResponse<SpotifyApi.PagingObject<T>>> }>(
    request: FastifyRequest,
    reply: FastifyReply,
    func: FunctionType,
    ...args: Parameters<FunctionType>
  ): Promise<UnPage<UnResponse<UnPromise<ReturnType<FunctionType>>>>[]> {
    const enrichedArgs = (Object.assign({ offset: 0, limit: 1 }, args[0])) as Parameters<FunctionType>;
    return this.execAndHandle(request, reply, func, ...enrichedArgs)
      .then(r => SpotifyApiService.getOffsetArray(r.body.total))
      .then(offsetArray => this.getPromisesArray(offsetArray, request, reply, func, ...args))
      .then(promisesArray => Promise.all(promisesArray))
      .then(arrayOfArrays => arrayOfArrays.reduce((acc, array) => acc.concat(array), []))
  }

  private handleErrors<FunctionType extends (...p: any) => any>(error: SpotifyApiResponse, request: FastifyRequest, reply: FastifyReply, func: FunctionType, ...args: Parameters<FunctionType>): Promise<ReturnType<FunctionType>> {
    if (error.statusCode === 401) return this.handle401(error, func.bind(this, ...args), request, reply);
    if (error.statusCode === 429) return this.handle429(error, func.bind(this, ...args), request, reply);
    throw new ErrorWithStatus(error.statusCode, error.body.error?.message);
  }

  private async handle401<FunctionType extends (...p: any) => any>(error: SpotifyApiResponse, apiRequest: FunctionType, request: FastifyRequest, reply: FastifyReply): Promise<ReturnType<FunctionType>> {
    const token = this.sharedService.decryptToken(request.cookies[this.fastify.config.cookieName]);
    let refreshed_token;
    refreshed_token = await this.fastify.spotify.getNewAccessTokenUsingRefreshToken(token.refresh_token!, {}).catch(() => null);
    if (!refreshed_token) {
      reply.redirect('/auth');
      return reply
    }
    // @ts-ignore
    this.api.setAccessToken(refreshed_token.token.access_token);
    reply.setCookie(
      this.fastify.config.cookieName,
      // @ts-ignore
      this.sharedService.encryptToken(Object.assign(token, refreshed_token.token)),
      cookieOptions);
    return apiRequest()
  }

  private async handle429<FunctionType extends (...args: any[]) => any>(error: SpotifyApiResponse, apiRequest: FunctionType, request: FastifyRequest, reply: FastifyReply): Promise<ReturnType<FunctionType>> {
    await new Promise((resolve) => {setTimeout(resolve, (parseInt(error.headers['retry-after'] || '0') + 1) * 1000)});
    return apiRequest()
  }

  private static getOffsetArray(total: number): number[] {
    return Array.from({ length: Math.ceil(total / 50) }, (_, i) => i * 50);
  }

  private getPromisesArray<FunctionType extends (...args: any[]) => Promise<SpotifyApiResponse<SpotifyApi.PagingObject<any>>>>(
    offsetArray: number[],
    request: FastifyRequest,
    reply: FastifyReply,
    func: FunctionType,
    ...args: Parameters<FunctionType>
  ) {
    return offsetArray.map((offsetItem) => {
      const enrichedArgs = (Object.assign({ offset: offsetItem, limit: 50 }, args[0])) as Parameters<FunctionType>;
      return this.execAndHandle(request, reply, func, ...enrichedArgs).then(r => r.body.items)
    })
  }

}
