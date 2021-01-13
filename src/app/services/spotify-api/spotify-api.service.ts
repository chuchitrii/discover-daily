import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecommendationsObject, RecommendationsOptionsObject } from '../../models/spotify-api';

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

  q(object: any): HttpParams {
    Object.keys(object).forEach((key) => {
      if (Array.isArray(object[key])) {
        object[key] = object[key].join();
      }
    });
    return new HttpParams({ fromObject: object });
  }

  authRequest(queryParams: { client_id: string; response_type: string; redirect_uri: string; scope: string; state: string }): void {
    window.location.href = `https://accounts.spotify.com/authorize?${this.q(queryParams)}`;
  }

  getUserProfile(): Observable<any> {
    return this.http.get(this.apiBase + 'v1/me', {
      headers: this.h(),
    });
  }

  getPlaylists(userId: string, queryParams: { offset: number; limit: number } = this.defaultQ): Observable<any> {
    return this.http.get(`${this.apiBase}v1/users/${userId}/playlists?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  getSavedTracks(queryParams: { offset: number; limit: number } = this.defaultQ): Observable<any> {
    return this.http.get(`${this.apiBase}v1/me/tracks?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  getRecommendedTracks(queryParams: RecommendationsOptionsObject): Observable<RecommendationsObject> {
    return this.http.get<RecommendationsObject>(`${this.apiBase}v1/recommendations?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  getFilterMask(queryParams: { ids: string[] }): Observable<any> {
    return this.http.get(`${this.apiBase}v1/me/tracks/contains?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  createPlaylist(
    body: {
      name: string;
      public?: boolean;
      collaborative?: boolean;
      description: string;
    },
    user: any
  ): Observable<any> {
    const userId = user.id;

    return this.http.post(`${this.apiBase}v1/users/${userId}/playlists`, JSON.stringify(body), {
      headers: this.h().append('Content-Type', 'application/json'),
    });
  }

  postTracksToPlaylist(body: { uris: string[] }, playlistId: string): Observable<any> {
    return this.http.post(`${this.apiBase}v1/playlists/${playlistId}/tracks?`, body, {
      headers: this.h().append('Content-Type', 'application/json'),
    });
  }

  replaceTracksInPlaylist(body: { uris: string[] }, playlistId: string): Observable<any> {
    return this.http.put(`${this.apiBase}v1/playlists/${playlistId}/tracks?`, body, {
      headers: this.h().append('Content-Type', 'application/json'),
    });
  }

  uploadPlaylistCover(body: string, playlistId: string) {
    return this.http.put(`${this.apiBase}v1/playlists/${playlistId}/images`, body, {
      headers: this.h().append('Content-Type', 'image/jpeg'),
    });
  }

  getTopArtists(queryParams: { time_range?: 'short_term' | 'medium_term' | 'long_term'; limit?: number; offset?: number }) {
    return this.http.get(`${this.apiBase}v1/me/top/artists?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }
}
