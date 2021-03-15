import { TrackObjectFull, ArtistObjectSimplified, ArtistObjectFull } from './spotify-api';

export interface IGenreModel {
  name: string;
  tracks: ITrackGenreModel[];
  artists: IArtistGenreModel[];
  isSelected: boolean;
}

export interface IArtistGenreModel {
  name: string;
  id: string;
  uri: string;
}

export interface ITrackGenreModel {
  artists: IArtistGenreModel[];
  id: string;
  uri: string;
  preview_url: string;
}

export interface IArtistWithTracks extends ArtistObjectSimplified {
  tracks: TrackObjectFull[];
}

export interface IArtistWithTracksAndGenres extends IArtistWithTracks {
  genres: string[];
}

export class GenreModel implements IGenreModel {
  name: string;
  tracks: ITrackGenreModel[];
  artists: IArtistGenreModel[];
  isSelected: boolean;
  constructor(name: string, artist: IArtistWithTracksAndGenres, tracks: TrackObjectFull[]) {
    this.name = name;
    this.artists = [new ArtistGenreModel(artist)];
    this.tracks = tracks.map((track) => new TrackGenreModel(track));
    this.isSelected = false;
  }
}

export class ArtistGenreModel implements IArtistGenreModel {
  name: string;
  id: string;
  uri: string;
  constructor(artist: ArtistObjectFull | IArtistWithTracksAndGenres | ArtistObjectSimplified) {
    this.name = artist.name;
    this.id = artist.id;
    this.uri = artist.uri;
  }
}

export class TrackGenreModel implements ITrackGenreModel {
  name: string;
  artists: IArtistGenreModel[];
  id: string;
  uri: string;
  preview_url: string;

  constructor(track: TrackObjectFull) {
    this.name = track.name;
    this.artists = track.artists.map((artist) => new ArtistGenreModel(artist));
    this.id = track.id;
    this.uri = track.uri;
    this.preview_url = track.preview_url;
  }
}
