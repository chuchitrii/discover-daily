import { Actions, createEffect, ofType } from '@ngrx/effects';
import { fetchUser, fetchUserSucceeded, fetchUserFailed } from './discover.actions';
import { catchError, concatMap, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';
import { SpotifyApiService } from '../services/spotify-api/spotify-api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class DiscoverEffects {
  public fetchUser$ = createEffect(() =>
    this.actions.pipe(
      ofType(fetchUser),
      switchMap(() =>
        this.api.getUserProfile().pipe(
          map((user) => fetchUserSucceeded({ user })),
          catchError((error: HttpErrorResponse) => of(fetchUserFailed({ error: error.error })))
        )
      )
    )
  );

  constructor(private actions: Actions, private api: SpotifyApiService) {}
}
