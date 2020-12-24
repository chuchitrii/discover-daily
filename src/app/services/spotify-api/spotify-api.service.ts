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
    const url = 'https://accounts.spotify.com/authorize?' + this.q(queryParams).toString();
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
  ): Observable<any> {
    return this.http.get(`${this.apiBase}v1/users/${userId}/playlists?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  getSavedTracks(queryParams: { offset: number; limit: number } = this.defaultQ): Observable<any> {
    return this.http.get(`${this.apiBase}v1/me/tracks?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  getRecommendedTracks(queryParams: { limit: number; seed_tracks: string[] }): Observable<any> {
    return this.http.get(`${this.apiBase}v1/recommendations?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  getFilterMask(queryParams: { ids: string[] }): Observable<any> {
    return this.http.get(`${this.apiBase}v1/me/tracks/contains?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  postTracksToPlaylist(queryParams: { uris: string[] }, playlistId: string): Observable<any> {
    return this.http.post(`${this.apiBase}v1/playlists/${playlistId}/tracks?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }
}
