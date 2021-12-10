import { createAction, props } from '@ngrx/store';
import { UserObjectPrivate } from '../models/spotify-api';

export const fetchUser = createAction('Fetch user', props<{ noProp?: any }>());
export const fetchUserSucceeded = createAction('Fetch user succeeded', props<{ user: UserObjectPrivate }>());
export const fetchUserFailed = createAction('Fetch user failed', props<{ error: Error }>());
