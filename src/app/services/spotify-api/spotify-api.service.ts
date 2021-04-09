import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  ArtistObjectFull,
  IAddTracksToPlaylist,
  IAuthQueryParams,
  ICreatePlaylist,
  IGetUserTopArtist,
  IQueryParams,
  PagingObject,
  PlaylistObjectFull,
  PlaylistObjectSimplified,
  PlaylistSnapshotResponse,
  RecommendationsObject,
  RecommendationsOptionsObject,
  SavedTrackObject,
  UserObjectPublic,
  MultipleArtistsResponse,
} from '../../models/spotify-api';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SpotifyApiService {
  apiBase = 'https://api.spotify.com/';
  defaultQ: IQueryParams = { offset: 0, limit: 50 };

  constructor(private http: HttpClient) {}

  h(): HttpHeaders {
    return new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('access_token'),
    });
  }

  q(object: any): HttpParams | string {
    const fromObject = {};
    if (!object) {
      return '';
    }
    Object.keys(object).forEach((key) => {
      if (object[key] !== null && object[key] !== undefined) {
        fromObject[key] = object[key];
      }
      if (Array.isArray(object[key])) {
        fromObject[key] = object[key].join();
      }
    });
    return new HttpParams({ fromObject });
  }

  authRequest(queryParams: IAuthQueryParams): void {
    window.location.href = `https://accounts.spotify.com/authorize?${this.q(queryParams)}`;
  }

  getUserProfile(): Observable<UserObjectPublic> {
    return this.http.get<UserObjectPublic>(this.apiBase + 'v1/me', {
      headers: this.h(),
    });
  }

  getPlaylists(userId: string, queryParams: IQueryParams = this.defaultQ): Observable<PagingObject<PlaylistObjectSimplified>> {
    return this.http.get<PagingObject<PlaylistObjectSimplified>>(`${this.apiBase}v1/users/${userId}/playlists?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  getSavedTracks(queryParams: IQueryParams = this.defaultQ): Observable<PagingObject<SavedTrackObject>> {
    return this.http.get<PagingObject<SavedTrackObject>>(`${this.apiBase}v1/me/tracks?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  getRecommendedTracks(queryParams: RecommendationsOptionsObject): Observable<RecommendationsObject> | Observable<any> {
    return this.http
      .get<RecommendationsObject>(`${this.apiBase}v1/recommendations?${this.q(queryParams)}`, {
        headers: this.h(),
      })
      .pipe(
        catchError((e) => {
          console.warn(e);
          return of([]);
        })
      );
  }

  getFilterMask(queryParams: { ids: string[] }): Observable<Array<boolean>> {
    return this.http.get<Array<boolean>>(`${this.apiBase}v1/me/tracks/contains?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  createPlaylist(body: ICreatePlaylist, user: UserObjectPublic): Observable<PlaylistObjectFull> {
    return this.http.post<PlaylistObjectFull>(`${this.apiBase}v1/users/${user.id}/playlists`, JSON.stringify(body), {
      headers: this.h().append('Content-Type', 'application/json'),
    });
  }

  postTracksToPlaylist(body: IAddTracksToPlaylist, playlistId: string): Observable<PlaylistSnapshotResponse> {
    return this.http.post<PlaylistSnapshotResponse>(`${this.apiBase}v1/playlists/${playlistId}/tracks?`, body, {
      headers: this.h().append('Content-Type', 'application/json'),
    });
  }

  replaceTracksInPlaylist(body: { uris: string[] }, playlistId: string): Observable<any> {
    return this.http.put(`${this.apiBase}v1/playlists/${playlistId}/tracks?`, body, {
      headers: this.h().append('Content-Type', 'application/json'),
    });
  }

  uploadPlaylistCover(body: string, playlistId: string): Observable<any> {
    return this.http.put(`${this.apiBase}v1/playlists/${playlistId}/images`, body, {
      headers: this.h().append('Content-Type', 'image/jpeg'),
    });
  }

  getTopArtists(queryParams?: IGetUserTopArtist): Observable<PagingObject<ArtistObjectFull>> {
    return this.http.get<PagingObject<ArtistObjectFull>>(`${this.apiBase}v1/me/top/artists?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  getArtistsInformation(queryParams: { ids: string[] }): Observable<MultipleArtistsResponse> {
    return this.http.get<MultipleArtistsResponse>(`${this.apiBase}v1/artists?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }
}
