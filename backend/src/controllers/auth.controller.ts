import 'reflect-metadata'
import { Controller, FastifyInstanceToken, GET, getInstanceByToken } from 'fastify-decorators';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SharedService } from '../services/shared.service';
import { cookieOptions } from '../models/cookie-options.model';

@Controller("/auth")
export class AuthController {
  fastify: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  constructor(private sharedService: SharedService) {}

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
      .redirect(`${this.fastify.config.host}:${this.fastify.config.port}/api`);
  }
}
