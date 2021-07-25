import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  UserObjectPrivate,
} from '../../models/spotify-api';

@Injectable({
  providedIn: 'root',
})
export class SpotifyApiService {
  private readonly apiBase = 'https://api.spotify.com/';
  private readonly defaultQ: IQueryParams = { offset: 0, limit: 50 };

  constructor(private http: HttpClient) {}

  public authRequest(queryParams: IAuthQueryParams): void {
    window.location.href = `https://accounts.spotify.com/authorize?${this.q(queryParams)}`;
  }

  public getUserProfile(): Observable<UserObjectPrivate> {
    return this.http.get<UserObjectPrivate>(this.apiBase + 'v1/me', {
      headers: this.h(),
    });
  }

  public getCurrentUserPlaylist(queryParams: IQueryParams = this.defaultQ): Observable<PagingObject<PlaylistObjectSimplified>> {
    return this.http.get<PagingObject<PlaylistObjectSimplified>>(`${this.apiBase}v1/me/playlists?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  public getSavedTracks(queryParams: IQueryParams = this.defaultQ): Observable<PagingObject<SavedTrackObject>> {
    return this.http.get<PagingObject<SavedTrackObject>>(`${this.apiBase}v1/me/tracks?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  public getRecommendedTracks(queryParams: RecommendationsOptionsObject): Observable<RecommendationsObject> {
    return this.http.get<RecommendationsObject>(`${this.apiBase}v1/recommendations?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  public getFilterMask(queryParams: { ids: string[] }): Observable<Array<boolean>> {
    return this.http.get<Array<boolean>>(`${this.apiBase}v1/me/tracks/contains?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  public createPlaylist(body: ICreatePlaylist, user: UserObjectPublic): Observable<PlaylistObjectFull> {
    return this.http.post<PlaylistObjectFull>(`${this.apiBase}v1/users/${user.id}/playlists`, JSON.stringify(body), {
      headers: this.h().append('Content-Type', 'application/json'),
    });
  }

  public getTracksFromPlaylist(playlistId): Observable<PlaylistObjectFull> {
    return this.http.get<PlaylistObjectFull>(`${this.apiBase}v1/playlist/${playlistId}/tracks`, {
      headers: this.h().append('Content-Type', 'application/json'),
    });
  }

  public postTracksToPlaylist(body: IAddTracksToPlaylist, playlistId: string): Observable<PlaylistSnapshotResponse> {
    return this.http.post<PlaylistSnapshotResponse>(`${this.apiBase}v1/playlists/${playlistId}/tracks?`, body, {
      headers: this.h().append('Content-Type', 'application/json'),
    });
  }

  public replaceTracksInPlaylist(body: { uris: string[] }, playlistId: string): Observable<any> {
    return this.http.put(`${this.apiBase}v1/playlists/${playlistId}/tracks?`, body, {
      headers: this.h().append('Content-Type', 'application/json'),
    });
  }

  public uploadPlaylistCover(body: string, playlistId: string): Observable<any> {
    return this.http.put(`${this.apiBase}v1/playlists/${playlistId}/images`, body, {
      headers: this.h().append('Content-Type', 'images/jpeg'),
    });
  }

  public getTopArtists(queryParams?: IGetUserTopArtist): Observable<PagingObject<ArtistObjectFull>> {
    return this.http.get<PagingObject<ArtistObjectFull>>(`${this.apiBase}v1/me/top/artists?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  public getArtistsInformation(queryParams: { ids: string[] }): Observable<MultipleArtistsResponse> {
    return this.http.get<MultipleArtistsResponse>(`${this.apiBase}v1/artists?${this.q(queryParams)}`, {
      headers: this.h(),
    });
  }

  private h(): HttpHeaders {
    return new HttpHeaders({
      Authorization: 'Bearer ' + localStorage.getItem('access_token'),
    });
  }

  private q(object: any): HttpParams | string {
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
}
