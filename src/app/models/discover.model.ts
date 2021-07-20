import {
  TrackObjectFull,
  ArtistObjectSimplified,
  ArtistObjectFull,
  TrackObjectSimplified,
  RecommendationsOptionsObject,
} from './spotify-api';

export interface IGenreModel {
  name: string;
  tracks: ITrackModel[];
  artists: IArtistModel[];
  isSelected: boolean;
  displayArtists: string;
  addArtist: (artist: IArtistWithTracksAndGenres) => void;
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
  displayArtists: string;
  isSelected: boolean;

  constructor(name: string, artist: IArtistWithTracksAndGenres, tracks: TrackObjectFull[]) {
    this.name = name;
    this.artists = [new ArtistModel(artist)];
    this.displayArtists = artist.name;
    this.tracks = tracks.map((track) => new TrackModel(track));
    this.isSelected = false;
  }

  addArtist(artist) {
    this.artists.push(new ArtistModel(artist));
    this.displayArtists = this.artists
      .map((a) => a.name)
      .slice(0, 2)
      .join(', ');
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

export interface IGenreForRecommendation {
  genreName: string;
  tracksForRequest: string[];
  tracksFromResponse: TrackObjectSimplified[];
  toDelete: boolean;
}

export class GenreForRecommendation implements IGenreForRecommendation {
  genreName: string;
  tracksForRequest: string[];
  tracksFromResponse: TrackObjectSimplified[];
  toDelete: boolean;

  constructor(genre: GenreModel) {
    this.genreName = genre.name;
    this.tracksForRequest = genre.tracks.map((track) => track.id);
    this.tracksFromResponse = [];
    this.toDelete = false;
  }
}

export class RecommendationsOptions implements RecommendationsOptionsObject {}

export class SetOfObjects extends Set {
  add(obj: any): this {
    for (const item of this) {
      if (this.compareObjects(obj, item)) {
        return this;
      }
    }
    super.add.call(this, obj);
    return this;
  }

  compareObjects(obj1: any, obj2: any): boolean {
    return obj1.id === obj2.id;
  }
}
