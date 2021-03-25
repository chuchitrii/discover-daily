import { TrackObjectFull, ArtistObjectSimplified, ArtistObjectFull } from './spotify-api';

export interface IGenreModel {
  name: string;
  tracks: ITrackModel[];
  artists: IArtistModel[];
  isSelected: boolean;
}

export interface IArtistModel {
  name: string;
  id: string;
  uri: string;
}

export interface ITrackModel {
  artists: IArtistModel[];
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
  tracks: ITrackModel[];
  artists: IArtistModel[];
  isSelected: boolean;
  constructor(name: string, artist: IArtistWithTracksAndGenres, tracks: TrackObjectFull[]) {
    this.name = name;
    this.artists = [new ArtistModel(artist)];
    this.tracks = tracks.map((track) => new TrackModel(track));
    this.isSelected = false;
  }
}

export class ArtistModel implements IArtistModel {
  name: string;
  id: string;
  uri: string;
  constructor(artist: ArtistObjectFull | IArtistWithTracksAndGenres | ArtistObjectSimplified) {
    this.name = artist.name;
    this.id = artist.id;
    this.uri = artist.uri;
  }
}

export class TrackModel implements ITrackModel {
  name: string;
  artists: IArtistModel[];
  id: string;
  uri: string;
  preview_url: string;

  constructor(track: TrackObjectFull) {
    this.name = track.name;
    this.artists = track.artists.map((artist) => new ArtistModel(artist));
    this.id = track.id;
    this.uri = track.uri;
    this.preview_url = track.preview_url;
  }
}
