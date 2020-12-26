import { Injectable } from '@angular/core';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';

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

  async addTracksToPlaylist(recommendedTracks, user) {
    console.log(user);
    const queryParams = { uris: [] };
    recommendedTracks.map((x, i) => {
      queryParams.uris[i] = x.uri;
    });
    const userId = user.id;
    const playlistId = await this.findDiscoverPlaylist(userId);
    console.log(playlistId);
    const res = await this.api.postTracksToPlaylist(queryParams, playlistId).toPromise();
    console.log(res);
  }

  async getUserProfile() {
    const user = await this.api.getUserProfile().toPromise();
    console.log(user);
    return user;
  }

  async getUserPlaylists(userId): Promise<any> {
    const playlists = await this.api.getPlaylists(userId).toPromise();
    return playlists;
  }

  async findDiscoverPlaylist(userId) {
    console.log(userId);
    const playlists = await this.getUserPlaylists(userId);
    console.log(playlists);
    const playlistId = playlists.items[playlists.items.findIndex((p) => p.name === 'Discover Daily')].id;
    return playlistId;
  }

  async getAllSavedTracks() {
    const savedTracks: any[] = [];
    const q = this.defaultQ;
    let total = 0;

    do {
      const res = await this.api.getSavedTracks(q).toPromise();
      console.log(res);
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
}
