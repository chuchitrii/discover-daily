import { Injectable } from '@angular/core';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';

@Injectable({
  providedIn: 'root',
})
export class DiscoverService {
  defaultQ = { offset: 0, limit: 50 };

  constructor(private api: SpotifyApiService) {}

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

  async filterTracks(tracks) {
    const queryParams = { ids: tracks.map((t) => t.id) };
    const mask = await this.api.getFilterMask(queryParams).toPromise();
    return tracks.filter((x, i) => !mask[i]);
  }
}
