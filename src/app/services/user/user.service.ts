import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserObjectPrivate } from '../../models/spotify-api';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { AuthService } from '../auth/auth.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public user$: BehaviorSubject<UserObjectPrivate> = new BehaviorSubject<UserObjectPrivate>(null);

  public get id() {
    return this.user$.value.id;
  }

  public get country() {
    return this.user$.value.country;
  }

  constructor(private api: SpotifyApiService, private auth: AuthService) {
    this.auth.isLoggedIn$.subscribe((isLoggedIn) => {
      if (!isLoggedIn) {
        this.user$.next(null);
      }
    });
  }

  init(): Observable<UserObjectPrivate> {
    if (this.user$.value) return this.user$;
    return this.api.getUserProfile().pipe(tap((user) => this.user$.next(user)));
  }
}
