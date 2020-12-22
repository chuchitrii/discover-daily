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

  async getAllSavedTracks() {
    const savedTracks: any[] = [];
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

  filterTracks(tracks) {
    let mask;
    this.getFilterMask({
      ids: tracks.map((t) => t.id),
    })
      .toPromise()
      .then((m) => {
        mask = m;
      });
    return tracks.filter((x, i) => !mask[i]);
  }

  getFilterMask(queryParams: { ids: string }): Observable<any> {
    return this.http.get(
      `${this.apiBase}v1/me/tracks/contains?${this.q(queryParams)}`,
      {
        headers: this.h(),
      }
    );
  }

  getAllRecommendedTracks(savedTracks, count = 30) {
    const q = { limit: 5, seed_tracks: [] };
    const length = 5;
    const recommendedTracks: any[] = [];
    do {
      console.log(savedTracks[0]);
      q.seed_tracks = Array(length)
        .fill(null)
        .map(() => savedTracks[this.getRandomInt(savedTracks.length)].track.id);

      this.getRecommendedTracks(q)
        .toPromise()
        .then((res) => {
          this.filterTracks(res.tracks).then((filtered) => {
            recommendedTracks.push(...filtered);
          });
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

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}
