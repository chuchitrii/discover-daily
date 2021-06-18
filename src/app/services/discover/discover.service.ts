import { Injectable } from '@angular/core';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { images } from '../../models/images';
import {
  ArtistObjectFull,
  IGetUserTopArtist,
  PagingObject,
  PlaylistObjectSimplified,
  RecommendationsOptionsObject,
  SavedTrackObject,
  TrackObjectSimplified,
  UserObjectPublic,
} from '../../models/spotify-api';
import {
  ArtistModel,
  GenreModel,
  IArtistWithTracks,
  IArtistWithTracksAndGenres,
  IGenreModel,
  GenreForRecommendation,
  TrackModel,
  IGenreForRecommendation,
} from 'src/app/models/discover.model';

@Injectable({
  providedIn: 'root',
})
export class DiscoverService {
  user: UserObjectPublic;
  defaultQ = { offset: 0, limit: 50 };
  allSavedTracks: SavedTrackObject[] = [];
  recommendationGenres: GenreForRecommendation[] = [];
  loadingStatus: string;
  recommendationStatus: string;
  constructor(private api: SpotifyApiService) {}

  async getRecommendation(count?: number, selectedGenres?: GenreModel[], filter?) {
    this.recommendationStatus = `Search started`;
    if (this.allSavedTracks.length === 0) {
      this.allSavedTracks = await this.getAllSavedTracks();
    }
    return await this.getAllRecommendedTracks(this.allSavedTracks, count, selectedGenres, filter);
  }

  async getGenres(): Promise<GenreModel[]> {
    if (this.allSavedTracks.length === 0) {
      this.allSavedTracks = await this.getAllSavedTracks();
    }
    const artistsWithTracksAndGenres = await this.getArtistsWithTracksAndGenres(this.allSavedTracks);
    return this.createGenreList(artistsWithTracksAndGenres);
  }

  async addTracksToPlaylist(recommendedTracks, user, clear: boolean = true, playlistId?: string) {
    let playlist;
    const queryParams = { uris: [] };
    recommendedTracks.map((x, i) => {
      queryParams.uris[i] = x.uri;
    });

    if (!playlistId) {
      const body = {
        name: 'Discover Daily',
        description: 'Created with «Discover Daily» https://chuchitrii.github.io/discover-daily/',
      };
      playlist = await this.api.createPlaylist(body, user).toPromise();
      playlistId = playlist.id;
    }

    if (clear) {
      this.recommendationStatus = `Tracks have been added to your «Discover Daily» playlist`;
      return await this.api.replaceTracksInPlaylist(queryParams, playlistId).toPromise();
    } else {
      this.recommendationStatus = `Tracks have been added to your «Discover Daily» playlist`;
      return await this.api.postTracksToPlaylist(queryParams, playlistId).toPromise();
    }
  }

  getUserProfile(): void {
    this.api
      .getUserProfile()
      .toPromise()
      .then((user) => (this.user = user));
  }

  async getUserPlaylists(
    userId: string,
    queryParams: { offset: number; limit: number } = this.defaultQ
  ): Promise<PagingObject<PlaylistObjectSimplified>> {
    return await this.api.getPlaylists(userId, queryParams).toPromise();
  }

  async getAllPlaylists(userId): Promise<PlaylistObjectSimplified[]> {
    const playlists: PlaylistObjectSimplified[] = [];
    const q = {
      offset: 0,
      limit: 50,
    };
    let total: number;

    do {
      const res = await this.getUserPlaylists(userId, q);
      playlists.push(...res.items);
      q.offset += q.limit;
      total = res.total;
    } while (playlists.length < total);

    return playlists;
  }

  async findDiscoverPlaylist(): Promise<string> {
    const playlists = await this.getAllPlaylists(this.user.id);
    return playlists[playlists.findIndex((p) => p.name === 'Discover Daily')].id;
  }

  async getAllSavedTracks(): Promise<SavedTrackObject[]> {
    const savedTracks: SavedTrackObject[] = [];
    const q = { offset: 0, limit: 50 };
    let total = 0;

    do {
      const res = await this.api.getSavedTracks(q).toPromise();
      savedTracks.push(...res.items);
      total = res.total;
      q.offset += q.limit;
      this.loadingStatus = `Loading your saved tracks: ${q.offset} tracks out of ${total}...`;
    } while (savedTracks.length < total);

    return savedTracks;
  }

  async getAllRecommendedTracks(
    savedTracks: SavedTrackObject[],
    count = 30,
    selectedGenres?: GenreModel[],
    filter?: Partial<RecommendationsOptionsObject>
  ): Promise<TrackObjectSimplified[]> {
    const q = { limit: 50, seed_tracks: [] };
    const length = 5;
    const recommendedTracks: SetOfObjects = new SetOfObjects();
    let notEnoughTracks: boolean;

    if (selectedGenres.length > 0) {
      this.recommendationGenres = selectedGenres.reduce((acc, currentValue) => {
        acc.push(new GenreForRecommendation(currentValue));
        return acc;
      }, []);

      await this.fillRecommendationsGenres({ ...q, ...filter }, ...this.recommendationGenres);

      const quantity = Math.floor(count / this.recommendationGenres.length);

      do {
        if (!this.recommendationGenres.length) notEnoughTracks = true;
        for (const genre of this.recommendationGenres) {
          if (!genre.tracksFromResponse.length) {
            await this.fillRecommendationsGenres({ ...q, ...filter }, genre);
          }
          if (genre.toDelete) continue;
          genre.tracksFromResponse.slice(0, quantity).forEach((track) => recommendedTracks.add(track));
          genre.tracksFromResponse.splice(0, quantity);
          this.recommendationStatus = `Searching tracks for you. Found ${recommendedTracks.size} tracks out of 30...`;
        }
        this.clearRecommendationGenres();
      } while (!notEnoughTracks && recommendedTracks.size < count);
    } else {
      q.limit = 5;
      do {
        q.seed_tracks = Array(length)
          .fill(null)
          .map(() => savedTracks[this.getRandomInt(savedTracks.length)].track.id);
        const res = await this.api.getRecommendedTracks({ ...q, ...filter }).toPromise();
        const filtered = await this.filterTracks(res.tracks);
        filtered.forEach((track) => recommendedTracks.add(track));
      } while (recommendedTracks.size < count);
    }
    this.recommendationStatus = 'Search completed';
    return Array.from(recommendedTracks);
  }

  async fillRecommendationsGenres(q, ...genres: IGenreForRecommendation[]) {
    for (const genre of genres) {
      q.seed_tracks = [];
      if (genre.tracksForRequest.length <= 5) {
        q.seed_tracks.push(...genre.tracksForRequest);
        genre.tracksForRequest = [];
      } else {
        for (let i = 0; i < 5; i++) {
          if (!genre.tracksForRequest.length) {
            break;
          }
          const index = this.getRandomInt(genre.tracksForRequest.length);
          q.seed_tracks.push(genre.tracksForRequest[index]);
          genre.tracksForRequest.splice(index, 1);
        }
      }
      if (!q.seed_tracks.length) {
        genre.toDelete = true;
        continue;
      }
      const res = await this.api.getRecommendedTracks(q).toPromise();
      const filtered = await this.filterTracks(res.tracks);
      genre.tracksFromResponse.push(...filtered);
    }
  }

  clearRecommendationGenres() {
    this.recommendationGenres = this.recommendationGenres.filter((genre) => !genre.toDelete);
  }

  async filterTracks(tracks: TrackObjectSimplified[]) {
    if (!tracks?.length) return [];

    const queryParams = { ids: tracks.map((t) => t.id) };
    const mask = await this.api.getFilterMask(queryParams).toPromise();

    return tracks.filter((x, i) => !mask[i]);
  }

  getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  async uploadPlaylistCover(playlistId: string) {
    return await this.api.uploadPlaylistCover(images[this.getRandomInt(images.length)], playlistId).toPromise();
  }

  createArtistsWithTracksArray(savedTracks: SavedTrackObject[]): IArtistWithTracks[] {
    const artistsWithTracks: IArtistWithTracks[] = [];
    savedTracks.forEach((item) => {
      item.track.artists.forEach((artist) => {
        const i = artistsWithTracks.findIndex((artistWithTracks) => artist.name === artistWithTracks.name);
        if (i === -1) {
          const artistWithTracks: any = artist;
          const temp = [];
          temp.push(item.track);
          artistWithTracks.tracks = temp;
          artistsWithTracks.push(artistWithTracks);
        } else {
          artistsWithTracks[i].tracks.push(item.track);
        }
      });
    });
    return artistsWithTracks;
  }

  async getArtistObjectFull(ids: string[]): Promise<ArtistObjectFull[]> {
    const artistsFullObject: ArtistObjectFull[] = [];
    let limit = 50;
    let offset = 0;
    do {
      const res = await this.api.getArtistsInformation({ ids: ids.slice(offset, limit) }).toPromise();
      this.loadingStatus = `Loading info about artists: ${limit} artists out of ${ids.length}...`;
      artistsFullObject.push(...res.artists);
      limit += 50;
      offset += 50;
    } while (artistsFullObject.length < ids.length);

    return artistsFullObject;
  }

  async getArtistsWithTracksAndGenres(savedTracks): Promise<IArtistWithTracksAndGenres[]> {
    this.loadingStatus = `Analyzing your saved tracks...`;
    const artistsWithTracks = this.createArtistsWithTracksArray(savedTracks);
    const artistsWithGenres = await this.getArtistObjectFull(artistsWithTracks.map((artist) => artist.id));
    const artistsWithTracksAndGenres: IArtistWithTracksAndGenres[] = [];
    artistsWithTracks.forEach((artistWithTrack, i) => {
      const temp: any = artistWithTrack;
      temp.genres = artistsWithGenres[i].genres;
      artistsWithTracksAndGenres.push(temp);
    });
    return artistsWithTracksAndGenres;
  }

  createGenreList(array: IArtistWithTracksAndGenres[]): IGenreModel[] {
    const allGenres: IGenreModel[] = [];
    array.forEach((artist) => {
      artist.genres.forEach((genre) => {
        const i = allGenres.findIndex((genreModel) => genreModel.name === genre);
        if (i > -1) {
          allGenres[i].artists.push(new ArtistModel(artist));
          allGenres[i].tracks.push(...artist.tracks.map((track) => new TrackModel(track)));
        } else {
          allGenres.push(new GenreModel(genre, artist, artist.tracks));
        }
      });
    });
    allGenres.sort((a, b) => b.tracks.length - a.tracks.length);
    return allGenres;
  }

  async getTopArtists(queryParams?: IGetUserTopArtist) {
    return await this.api.getTopArtists(queryParams).toPromise();
  }
}

class SetOfObjects extends Set {
  add(obj: any): this {
    for (const item of this) {
      if (this.compareObjects(obj, item)) return this;
    }
    super.add.call(this, obj);
    return this;
  }

  compareObjects(obj1: any, obj2: any): boolean {
    return obj1.id === obj2.id;
  }
}
