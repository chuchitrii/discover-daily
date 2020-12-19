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

  authRequest(queryParams: any): void {
    const url =
      'https://accounts.spotify.com/authorize?' +
      this.q(queryParams).toString();
    window.location.href = url;
  }

  q(input: any): HttpParams {
    return new HttpParams({ fromObject: input });
  }

  getUserProfile(): Observable<unknown> {
    return this.http.get(this.apiBase + 'v1/me', {
      headers: this.h(),
    });
  }

  getPlaylists(
    userId: string,
    queryParams: any = { offset: 0, limit: 50 }
  ): Observable<unknown> {
    return this.http.get(
      `${this.apiBase}v1/users/${userId}/playlists?${this.q(queryParams)}`,
      {
        headers: this.h(),
      }
    );
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

  async fetchSavedTracks(limit, offset) {
    const promise = await fetch(
      `https://api.spotify.com/v1/me/tracks?limit=${limit}&offset=${offset}`,
      {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + this.access_token },
      }
    );
    return promise.json();
  }

  async fetchRecommendedTracks(limit, seedTracksArr) {
    const seed_tracks = seedTracksArr.join('%2C');
    const promise = await fetch(
      `https://api.spotify.com/v1/recommendations?limit=${limit}&seed_tracks=${seed_tracks}`,
      {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + this.access_token },
      }
    );
    return promise.json();
  }

  async getAllSavedTracks() {
    const fetchedSavedTracks = [];
    let offset = 0;
    const limit = 50;
    const response = await this.fetchSavedTracks(1, 0);
    const totalSavedTracks = response.total;
    while (fetchedSavedTracks.length < totalSavedTracks) {
      const response = await this.fetchSavedTracks(limit, offset);
      fetchedSavedTracks.push(...response.items);
      console.log(fetchedSavedTracks);
      offset += limit;
    }

    return fetchedSavedTracks;
  }

  async getRecommendedTracks(allSavedTracks) {
    const indexArray = [];
    const tracksArray = [];
    const recommendedTracks = [];

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        indexArray[j] = this.getRandomInt(allSavedTracks.length);
      }
      indexArray.forEach((value, index) => {
        tracksArray[index] = allSavedTracks[value].track.id;
      });
      const response = await this.fetchRecommendedTracks(10, tracksArray);
      recommendedTracks.push(...response.tracks);
    }
    console.log(recommendedTracks);
    return recommendedTracks;
  }

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

  async filterSavedTracks(tracks, tracksIds) {
    const seed_tracks = tracksIds.join('%2C');
    const promise = await fetch(
      `https://api.spotify.com/v1/me/tracks/contains?ids=${seed_tracks}`,
      {
        method: 'GET',
        headers: { Authorization: 'Bearer ' + this.access_token },
      }
    );
    const mask = await promise.json();
    console.log(mask);
    return tracks.filter((x, i) => !mask[i]);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}
