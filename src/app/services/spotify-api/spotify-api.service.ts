import { Injectable } from '@angular/core';
import { SpotifyAuthRequestQueryParams } from '../../models/spotify-query-params-model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpotifyApiService {
  access_token: string = null;
  apiBase = 'https://api.spotify.com/';
  headers: HttpHeaders;
  defaultQ = { offset: 0, limit: 50 };

  constructor(private http: HttpClient) {
    this.access_token = localStorage.getItem('access_token');
    this.headers = new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('access_token'),
    });
  }

  h(): HttpHeaders {
    return new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('access_token'),
    });
  }

  q(input: any): HttpParams {
    return new HttpParams({ fromObject: input });
  }

  authRequest(queryParams: {
    client_id: string;
    response_type: string;
    redirect_uri: string;
    scope: string;
    state: string;
  }): void {
    const url =
      'https://accounts.spotify.com/authorize?' +
      this.q(queryParams).toString();
    window.location.href = url;
  }

  getUserProfile(): Observable<unknown> {
    return this.http.get(this.apiBase + 'v1/me', {
      headers: this.h(),
    });
  }

  getPlaylists(
    userId: string,
    queryParams: { offset: number; limit: number } = this.defaultQ
  ): Observable<unknown> {
    return this.http.get(
      `${this.apiBase}v1/users/${userId}/playlists?${this.q(queryParams)}`,
      {
        headers: this.h(),
      }
    );
  }

  getSavedTracks(
    queryParams: { offset: number; limit: number } = this.defaultQ
  ): Observable<any> {
    return this.http.get(`${this.apiBase}v1/me/tracks?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  getAllSavedTracks() {
    const savedTracks: unknown[] = [];
    const q = this.defaultQ;
    let total = 0;

    do {
      this.getSavedTracks(q)
        .toPromise()
        .then((res) => {
          savedTracks.push(...res.items);
          total = res.total;
          q.offset += q.limit;
        });
    } while (savedTracks.length < total);

    return savedTracks;
  }

  getRecommendedTracks(queryParams: {
    limit: number;
    seed_tracks: string[];
  }): Observable<any> {
    return this.http.get(
      `${this.apiBase}v1/recommendations?${this.q(queryParams)}`,
      {
        headers: this.h(),
      }
    );
  }

  getFilterMask(queryParams: { ids: string }): Observable<any> {
    return this.http.get(
      `${this.apiBase}v1/me/tracks/contains?${this.q(queryParams)}`,
      {
        headers: this.h(),
      }
    );
  }

  getAllRecommendedTracks(savedTracks, count = 30): unknown[] {
    const q = { limit: 5, seed_tracks: [] };
    const length = 5;
    const recommendedTracks: unknown[] = [];
    const requestArray: unknown[] = [];
    let tempTracks = [];

    do {
      q.seed_tracks = Array(length)
        .fill(null)
        .map(() => savedTracks[this.getRandomInt(savedTracks.length)].track.id);

      this.getRecommendedTracks(q)
        .toPromise()
        .then((res) => {
          return res.tracks;
        })
        .then((tracks) => {
          tempTracks = tracks;
          return this.getFilterMask({
            ids: tracks.map((t) => t.id),
          });
        })
        .then((mask) => {
          return tempTracks.filter((x, i) => !mask[i]);
        })
        .then((filtered) => {
          recommendedTracks.push(...filtered);
        });
    } while (recommendedTracks.length < count);
    return recommendedTracks;
  }

  postTracksToPlaylist() {}

  async addTracksToPlaylist(playlistId, tracksURIs) {
    const seed_tracks = tracksURIs.join(',');
    const promise = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?uris=${seed_tracks}`,
      {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + this.access_token },
      }
    );
    return promise.json();
  }

  async main(userId): Promise<any> {
    const getPlayLists = await fetch(
      `https://api.spotify.com/v1/users/${userId}/playlists?offset=0&limit=50`,
      {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + this.access_token },
        // json: true
      }
    );
    const playlists = await getPlayLists.json();
    const playlistId =
      playlists.items[
        playlists.items.findIndex((p) => p.name === 'Discover Daily')
      ].id;

    const recommendedIds = [];
    const filteredURIs = [];

    const savedTracks = await this.getAllSavedTracks();
    console.log(savedTracks);

    const recommended = await this.getRecommendedTracks(savedTracks);
    console.log(recommended);

    recommended.forEach((v, i) => {
      recommendedIds[i] = v.id;
    });

    const filtered = await this.filterSavedTracks(recommended, recommendedIds);
    console.log(filtered);

    filtered.forEach((x, i) => {
      filteredURIs[i] = x.uri;
    });

    const ai = await this.addTracksToPlaylist(playlistId, filteredURIs);

    return filtered;
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}
