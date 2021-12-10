import 'reflect-metadata';
import dotenv from 'dotenv';
import { fastify, FastifyInstance } from 'fastify';
import fastifyCookie from 'fastify-cookie';
import { fastifyOauth2, OAuth2Namespace } from 'fastify-oauth2';
import fastifyOAS from 'fastify-oas';
import { bootstrap } from 'fastify-decorators';
import { AuthController } from './controllers/auth.controller';
import { ApiController } from './controllers/api.controller';
import { resolve } from 'path';
import * as process from 'process';
import crypto from 'crypto';

declare module 'fastify' {
  interface FastifyInstance {
    spotify: OAuth2Namespace,
    config: {
      cookieSecret: string,
      cookieSalt: string,
      cookieName: string,
      host: string,
      port: string
    },
  }
  interface FastifyRequest {
    fastify: FastifyInstance;
  }
}

// declare module fastifyOauth2 {
//   export interface OAuth2Namespace {
//     getNewAccessTokenUsingRefreshToken(refreshToken: string, params: Object): Promise<{token: OAuth2Token}>;
//   }
// }

dotenv.config();
const app: FastifyInstance = fastify();
app.decorate('config', {
  cookieName: 'discoverDailyId',
  cookieSecret: process.env['COOKIE_SECRET'] || crypto.randomBytes(32),
  cookieSalt: process.env['COOKIE_SALT'] || crypto.randomBytes(16),
  host: process.env['HOST'] || 'http://localhost',
  port: process.env['PORT'] || '3000',
});

app
  .register(fastifyCookie, {
    secret: process.env['COOKIE_SECRET']
  })
  // @ts-ignore https://github.com/fastify/fastify-oauth2/issues/120
  .register(fastifyOauth2, {
    name: 'spotify',
    scope: 'user-read-private user-library-modify user-library-read playlist-modify-public ugc-image-upload',
    credentials: {
      client: {
        id: process.env['CLIENT_ID'],
        secret: process.env['CLIENT_SECRET'],
      },
      auth: fastifyOauth2.SPOTIFY_CONFIGURATION,
    },
    startRedirectPath: '/auth',
    callbackUri: process.env['CALLBACK_URL'],
  })
  // @ts-ignore
  .register(fastifyOAS, {
    routePrefix: '/swagger',
    exposeRoute: true,
    swagger: {
      host: `${app.config.host}:${app.config.port}`,
      info: {
        title: 'Discover Daily',
        description: 'Discover Daily',
        version: '0.0.1',
      },
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  })
  .register(bootstrap, { controllers: [AuthController, ApiController] })
  .register(bootstrap, {directory: resolve(__dirname, 'services')})

app.listen(app.config.port, (err) => {
  if (err) {
    console.error(err);
    process.exit(-1);
  }
  console.log(`Backend started and listening on ${app.config.host}:${app.config.port}`);
  console.log(`Swagger available at ${app.config.host}:${app.config.port}/swagger`);
});
