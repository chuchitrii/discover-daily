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
  queryParams: SpotifyAuthRequestQueryParams;

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
    this.queryParams = new SpotifyAuthRequestQueryParams();
    this.queryParams.state = this.generateRandomString(16);
    localStorage.setItem('state', this.queryParams.state);
    this.api.authRequest(this.queryParams);
  }
}
