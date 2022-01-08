import 'reflect-metadata'
import { Controller, FastifyInstanceToken, GET, getInstanceByToken } from 'fastify-decorators';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SharedService } from '../services/shared.service';
import { cookieOptions } from '../models/cookie-options.model';
import { CacheService } from '../services/cache.service';

@Controller("/auth")
export class AuthController {
  fastify: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  constructor(private sharedService: SharedService, private cache: CacheService) {}

  @GET("/callback")
  async callbackHandler(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const token = await this.fastify.spotify.getAccessTokenFromAuthorizationCodeFlow(request);
    reply
      .setCookie(
        this.fastify.config.cookieName,
        this.sharedService.encryptToken(token),
        cookieOptions)
      .redirect('/');
  }

  @GET("/logout")
  logoutHandler(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const { refresh_token } = this.sharedService.decryptToken(request.cookies[this.fastify.config.cookieName]);
      this.cache.delN(refresh_token!)
      reply.clearCookie(this.fastify.config.cookieName)
    } catch (e) {
      reply.redirect('/');
      return;
    }
  }
}
