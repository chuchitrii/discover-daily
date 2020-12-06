import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  SpotifyAuthRequestQueryParams,
  SpotifyAuthResponseQueryParams,
} from '../spotify-auth-query-params-models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isLoggedIn$: BehaviorSubject<boolean>;

  constructor() {
    console.log('initiated');
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
    const client_id = '6f1db9ac4bfa4cbc8c11d365774cd6d3';
    const redirect_uri = 'http://localhost:8888/callback';
    const state = this.generateRandomString(16);
    const stateKey = 'spotify_auth_state';
    const scope =
      'user-read-private user-read-email user-library-modify user-library-read playlist-modify-public playlist-modify-private';
    localStorage.setItem(stateKey, state);
    console.log(localStorage.getItem(stateKey));

    let url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=token';
    url += '&client_id=' + encodeURIComponent(client_id);
    url += '&scope=' + encodeURIComponent(scope);
    url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
    url += '&state=' + encodeURIComponent(state);

    window.location.href = url;
  }
}
