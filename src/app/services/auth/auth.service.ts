import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn$: BehaviorSubject<boolean>;
  minTimeBeforeRefresh = 150000;
  authQueryParams = {
    client_id: '6f1db9ac4bfa4cbc8c11d365774cd6d3',
    response_type: 'token',
    redirect_uri: environment.callbackUrl,
    scope:
      'user-read-private user-read-email user-library-modify user-library-read playlist-modify-public playlist-modify-private ugc-image-upload user-top-read',
    state: null,
  };

  constructor(private api: SpotifyApiService, private router: Router) {
    this.isLoggedIn$ = new BehaviorSubject<boolean>(false);
  }

  generateRandomString(length): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  redirectToSpotify(): void {
    this.authQueryParams.state = this.generateRandomString(16);
    localStorage.setItem('state', this.authQueryParams.state);
    this.api.authRequest(this.authQueryParams);
  }

  removeLocalStorageItems() {
    ['access_token', 'expires_in', 'accessed_at', 'state'].forEach((value) => localStorage.removeItem(value));
  }

  isLoggedIn(): boolean {
    if (localStorage.getItem('access_token')) {
      if (
        this.minTimeBeforeRefresh <
        Number(localStorage.getItem('accessed_at')) + Number(localStorage.getItem('expires_in') + '000') - Date.now()
      ) {
        this.isLoggedIn$.next(true);
        return true;
      } else {
        this.removeLocalStorageItems();
        this.isLoggedIn$.next(false);
        return false;
      }
    } else {
      this.removeLocalStorageItems();
      this.isLoggedIn$.next(false);
      return false;
    }
  }

  logout() {
    this.removeLocalStorageItems();
    this.router.navigate(['/login']);
  }
}
