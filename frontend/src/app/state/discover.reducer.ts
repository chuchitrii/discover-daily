import { createReducer } from '@ngrx/store';
import { GenreModel, ITopArtists } from '../models/discover.model';
import { PlaylistObjectSimplified, SavedTrackObject, TrackObjectSimplified, UserObjectPrivate } from '../models/spotify-api';

export interface DiscoverState {
  topArtists: ITopArtists;
  savedTracks: SavedTrackObject[];
  genres: GenreModel[];
  recommendedSongs: TrackObjectSimplified[];
  playlists: PlaylistObjectSimplified[];
  user: UserObjectPrivate;
}

const initialState: DiscoverState = {
  topArtists: null,
  savedTracks: null,
  genres: null,
  recommendedSongs: null,
  playlists: null,
  user: null,
};

export const discoverState = createReducer<DiscoverState>(initialState);
