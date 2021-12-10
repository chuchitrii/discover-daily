import 'reflect-metadata';
import { Controller, FastifyInstanceToken, GET, getInstanceByToken, Hook } from 'fastify-decorators';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { SharedService } from '../services/shared.service';
import { SpotifyApiService } from '../services/spotify-api.service';
import {
  TopArtistsForAllTerms,
  topArtistsForAllTermsResponseSchema, TopArtistsTerms,
  topArtistTerms,
} from '../models/spotify.model';

@Controller('/api')
export class ApiController {
  fastify: FastifyInstance = getInstanceByToken(FastifyInstanceToken);

  constructor(private sharedService: SharedService, private spotify: SpotifyApiService) {
  }

  @Hook('preHandler')
  preHandler(
    request: FastifyRequest,
    reply: FastifyReply,
    next: any,
  ) {
    if (!request.cookies[this.fastify.config.cookieName]) {
      reply.redirect('/auth');
      return;
    }
    try {
      const token = this.sharedService.decryptToken(request.cookies[this.fastify.config.cookieName]);
      this.spotify.setAccessToken(token.access_token);
    } catch (e) {
      reply.redirect('/auth');
      return;
    }
    next();
  }

  @GET('/429')
  async getHandler(request: FastifyRequest, reply: FastifyReply) {
    return Promise.all(Array.from({ length: 30 })
      .map(() => this.spotify.execAndHandle(request, reply, this.spotify.getMe).then((r) => r.body))
    );
  }

  @GET('/me')
  getMe(request: FastifyRequest, reply: FastifyReply) {
    return this.spotify.execAndHandle(request, reply, this.spotify.getMe).then((r) => r.body);
  }

  @GET('/top-artists-for-all-terms', {
    schema: { response: { 200: topArtistsForAllTermsResponseSchema } },
  })
  getTopArtistsForAllTerms(request: FastifyRequest, reply: FastifyReply): Promise<TopArtistsForAllTerms> {
    return Promise.all(
      topArtistTerms.map(
        (time_range) => this.spotify.execAndHandle(request, reply, this.spotify.getMyTopArtists, { time_range })
          .then((r) => {
            return { [time_range]: r.body.items };
          }),
      ),
    ).then((arrayOfResponses) => {
      return arrayOfResponses.reduce((acc: {[key in TopArtistsTerms]: Array<SpotifyApi.ArtistObjectFull>}, response) => acc = { ...acc, ...response }, {} as {[key in TopArtistsTerms]: Array<SpotifyApi.ArtistObjectFull>});
    });
  }

  @GET('/saved-tracks-all')
  getAllSavedTracks(request: FastifyRequest, reply: FastifyReply) {
    return this.spotify.getAllItemsFromListOfUnknownLength(request, reply, this.spotify.getMySavedTracks)
  }

  @GET('/user-playlists-all')
  getAllMyPlaylists(request: FastifyRequest, reply: FastifyReply) {
    return this.spotify.getAllItemsFromListOfUnknownLength(request, reply, this.spotify.getUserPlaylists)
  }
}
