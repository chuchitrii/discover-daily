import { Injectable } from '@angular/core';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { image } from '../../models/image';

@Injectable({
  providedIn: 'root',
})
export class DiscoverService {
  defaultQ = { offset: 0, limit: 50 };

  constructor(private api: SpotifyApiService) {}

  async getRecommendation() {
    const savedTracks = await this.getAllSavedTracks();
    const recommendedTracks = await this.getAllRecommendedTracks(savedTracks);
    return recommendedTracks;
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
      const res = await this.api.replaceTracksInPlaylist(queryParams, playlistId).toPromise();
      return res;
    } else {
      const res = await this.api.postTracksToPlaylist(queryParams, playlistId).toPromise();
      return res;
    }
  }

  async getUserProfile() {
    const user = await this.api.getUserProfile().toPromise();
    return user;
  }

  async getUserPlaylists(userId: string, queryParams: { offset: number; limit: number } = this.defaultQ): Promise<any> {
    const playlists = await this.api.getPlaylists(userId).toPromise();
    return playlists;
  }

  async getAllPlaylists(userId) {
    const playlists = [];
    const q = {
      offset: 0,
      limit: 50,
    };
    let total;

    do {
      const res = await this.getUserPlaylists(userId, q);
      playlists.push(...res.items);
      q.offset += q.limit;
      total = res.total;
    } while (playlists.length < total);

    return playlists;
  }

  async findDiscoverPlaylist(user): Promise<string> {
    const userId = user.id;
    console.log(userId);
    const playlists = await this.getAllPlaylists(userId);
    console.log(playlists);

    return playlists[playlists.findIndex((p) => p.name === 'Discover Daily')].id;
  }

  async getAllSavedTracks() {
    const savedTracks: any[] = [];
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

  async getAllRecommendedTracks(savedTracks, count = 30) {
    const q = { limit: 5, seed_tracks: [] };
    const length = 5;
    const recommendedTracks: any[] = [];

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

  async filterTracks(tracks) {
    const queryParams = { ids: tracks.map((t) => t.id) };
    const mask = await this.api.getFilterMask(queryParams).toPromise();

    return tracks.filter((x, i) => !mask[i]);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  async uploadPlaylistCover(playlistId: string) {
    const body = image;
    return await this.api.uploadPlaylistCover(body, playlistId).toPromise();
  }
}
