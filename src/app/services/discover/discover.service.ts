import { Injectable } from '@angular/core';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';

@Injectable({
  providedIn: 'root',
})
export class DiscoverService {
  defaultQ = { offset: 0, limit: 50 };

  constructor(private api: SpotifyApiService) {}

  async getUserProfile() {
    const user = await this.api.getUserProfile();
    return user;
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

  getPlaylist() {}

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}
