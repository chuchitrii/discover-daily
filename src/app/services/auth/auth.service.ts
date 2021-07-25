import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { DiscoverService } from '../discover/discover.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isLoggedIn$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  minTimeBeforeRefresh = 150000;
  authQueryParams = {
    client_id: '6f1db9ac4bfa4cbc8c11d365774cd6d3',
    response_type: 'token',
    redirect_uri: environment.callbackUrl,
    scope: 'user-read-private user-library-modify user-library-read playlist-modify-public ugc-image-upload',
    state: null,
  };

  constructor(private api: SpotifyApiService, private router: Router, private d: DiscoverService, private user: UserService) {}

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

  removeLocalStorageItems(): void {
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
        this.clear();
        return false;
      }
    } else {
      this.clear();
      return false;
    }
  }

  logout() {
    this.clear();
    this.router.navigate(['/login']).then();
  }

  clear() {
    this.removeLocalStorageItems();
    this.d.clear();
    this.user.clear();
    this.isLoggedIn$.next(false);
  }
}
