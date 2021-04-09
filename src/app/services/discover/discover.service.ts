import { Injectable } from '@angular/core';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { image } from '../../models/image';
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
  defaultQ = { offset: 0, limit: 50 };
  allSavedTracks: SavedTrackObject[] = [];
  recommendationGenres: GenreForRecommendation[] = [];
  recommendedTracks;

  constructor(private api: SpotifyApiService) {}

  async getRecommendation(count?: number, selectedGenres?: GenreModel[], filter?) {
    console.log(filter);
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

  async addTracksToPlaylist(recommendedTracks, user, clear: boolean, playlistId?: string) {
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
      return await this.api.replaceTracksInPlaylist(queryParams, playlistId).toPromise();
    } else {
      return await this.api.postTracksToPlaylist(queryParams, playlistId).toPromise();
    }
  }

  async getUserProfile(): Promise<UserObjectPublic> {
    return await this.api.getUserProfile().toPromise();
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

  async findDiscoverPlaylist(user: UserObjectPublic): Promise<string> {
    const userId = user.id;
    const playlists = await this.getAllPlaylists(userId);

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
    const recommendedTracks: TrackObjectSimplified[] = [];
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
          recommendedTracks.push(...genre.tracksFromResponse.slice(0, quantity));
          genre.tracksFromResponse.splice(0, quantity);
        }
        this.clearRecommendationGenres();
      } while (!notEnoughTracks && recommendedTracks.length < count);
    } else {
      q.limit = 5;
      do {
        q.seed_tracks = Array(length)
          .fill(null)
          .map(() => savedTracks[this.getRandomInt(savedTracks.length)].track.id);
        const res = await this.api.getRecommendedTracks(q).toPromise();
        const filtered = await this.filterTracks(res.tracks);
        recommendedTracks.push(...filtered);
      } while (recommendedTracks.length < count);
    }
    return recommendedTracks;
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
    if (!tracks.length) return tracks;

    const queryParams = { ids: tracks.map((t) => t.id) };
    const mask = await this.api.getFilterMask(queryParams).toPromise();

    return tracks.filter((x, i) => !mask[i]);
  }

  getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  async uploadPlaylistCover(playlistId: string) {
    return await this.api.uploadPlaylistCover(image, playlistId).toPromise();
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
      artistsFullObject.push(...res.artists);
      limit += 50;
      offset += 50;
    } while (artistsFullObject.length < ids.length);

    return artistsFullObject;
  }

  async getArtistsWithTracksAndGenres(savedTracks): Promise<IArtistWithTracksAndGenres[]> {
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
