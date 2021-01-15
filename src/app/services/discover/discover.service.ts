import { Injectable } from '@angular/core';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { image } from '../../models/image';
import {
  PagingObject,
  PlaylistObjectSimplified,
  SavedTrackObject,
  TrackObjectSimplified,
  UserObjectPublic,
} from '../../models/spotify-api';

@Injectable({
  providedIn: 'root',
})
export class DiscoverService {
  defaultQ = { offset: 0, limit: 50 };

  constructor(private api: SpotifyApiService) {}

  async getRecommendation() {
    const savedTracks = await this.getAllSavedTracks();
    return await this.getAllRecommendedTracks(savedTracks);
  }

  async addTracksToPlaylist(recommendedTracks, user, clear: boolean, playlistId?: string) {
    let playlist;
    const queryParams = { uris: [] };
    recommendedTracks.map((x, i) => {
      queryParams.uris[i] = x.uri;
    });

    if (!playlistId) {
      const body = {
        name: 'Discover Daily',
        description: 'Created with «Discover Daily» https://chuchitrii.github.io/discover-daily/',
      };
      playlist = await this.api.createPlaylist(body, user).toPromise();
      playlistId = playlist.id;
    }

    console.log(playlistId);
    this.uploadPlaylistCover(playlistId).then((res) => console.log(res));

    if (clear) {
      return await this.api.replaceTracksInPlaylist(queryParams, playlistId).toPromise();
    } else {
      return await this.api.postTracksToPlaylist(queryParams, playlistId).toPromise();
    }
  }

  async getUserProfile(): Promise<UserObjectPublic> {
    return await this.api.getUserProfile().toPromise();
  }

  async getUserPlaylists(
    userId: string,
    queryParams: { offset: number; limit: number } = this.defaultQ
  ): Promise<PagingObject<PlaylistObjectSimplified>> {
    return await this.api.getPlaylists(userId, queryParams).toPromise();
  }

  async getAllPlaylists(userId): Promise<PlaylistObjectSimplified[]> {
    const playlists: PlaylistObjectSimplified[] = [];
    const q = {
      offset: 0,
      limit: 50,
    };
    let total: number;

    do {
      const res = await this.getUserPlaylists(userId, q);
      playlists.push(...res.items);
      q.offset += q.limit;
      total = res.total;
    } while (playlists.length < total);

    return playlists;
  }

  async findDiscoverPlaylist(user: UserObjectPublic): Promise<string> {
    const userId = user.id;
    const playlists = await this.getAllPlaylists(userId);

    return playlists[playlists.findIndex((p) => p.name === 'Discover Daily')].id;
  }

  async getAllSavedTracks(): Promise<SavedTrackObject[]> {
    const savedTracks: SavedTrackObject[] = [];
    const q = { offset: 0, limit: 50 };
    let total = 0;

    do {
      const res = await this.api.getSavedTracks(q).toPromise();
      savedTracks.push(...res.items);
      total = res.total;
      q.offset += q.limit;
    } while (savedTracks.length < total);

    return savedTracks;
  }

  async getAllRecommendedTracks(savedTracks, count = 30): Promise<TrackObjectSimplified[]> {
    const q = { limit: 5, seed_tracks: [] };
    const length = 5;
    const recommendedTracks: TrackObjectSimplified[] = [];

    do {
      q.seed_tracks = Array(length)
        .fill(null)
        .map(() => savedTracks[this.getRandomInt(savedTracks.length)].track.id);
      const res = await this.api.getRecommendedTracks(q).toPromise();
      const filtered = await this.filterTracks(res.tracks);
      recommendedTracks.push(...filtered);
    } while (recommendedTracks.length < count);

    return recommendedTracks;
  }

  async filterTracks(tracks: TrackObjectSimplified[]) {
    const queryParams = { ids: tracks.map((t) => t.id) };
    const mask = await this.api.getFilterMask(queryParams).toPromise();

    return tracks.filter((x, i) => !mask[i]);
  }

  getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  async uploadPlaylistCover(playlistId: string) {
    return await this.api.uploadPlaylistCover(image, playlistId).toPromise();
  }
}
