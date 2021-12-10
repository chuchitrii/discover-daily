import { createSelector } from '@ngrx/store';
import { DiscoverState } from './discover.reducer';

const selectDiscoverState = (state: DiscoverState) => state;

export const selectUser = createSelector(selectDiscoverState, (state) => state.user);
