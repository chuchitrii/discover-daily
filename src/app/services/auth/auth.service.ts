import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  SpotifyAuthRequestQueryParams,
  SpotifyAuthResponseQueryParams,
} from '../../models/spotify-query-params-model';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn$: BehaviorSubject<boolean>;
  queryParams = {
    client_id: '6f1db9ac4bfa4cbc8c11d365774cd6d3',
    response_type: 'token',
    redirect_uri: 'http://localhost:8888/callback',
    scope:
      'user-read-private user-read-email user-library-modify user-library-read playlist-modify-public playlist-modify-private',
    state: null,
  };

  constructor(private api: SpotifyApiService) {
    this.isLoggedIn$ = new BehaviorSubject<boolean>(false);
  }

  generateRandomString(length): string {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  redirectToSpotify(): void {
    this.queryParams.state = this.generateRandomString(16);
    localStorage.setItem('state', this.queryParams.state);
    this.api.authRequest(this.queryParams);
  }
}
