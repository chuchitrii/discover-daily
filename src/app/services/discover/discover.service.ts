import { Injectable } from '@angular/core';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { images } from '../../models/images';
import {
  ArtistObjectFull,
  IQueryParams,
  PagingObject,
  PlaylistObjectSimplified,
  RecommendationsOptionsObject,
  SavedTrackObject,
  TrackObjectSimplified,
} from '../../models/spotify-api';
import {
  GenreModel,
  IArtistWithTracks,
  IArtistWithTracksAndGenres,
  GenreForRecommendation,
  TrackModel,
  IGenreForRecommendation,
  SetOfObjects,
  topArtistsTerms,
} from 'src/app/models/discover.model';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { UserService } from '../user/user.service';
import { catchError, map } from 'rxjs/operators';
import { ITopArtists } from 'src/app/models/discover.model';

@Injectable({
  providedIn: 'root',
})
export class DiscoverService {
  savedTracks: SavedTrackObject[];
  recommendationStatus: string;
  discoverPlaylistId: string;

  public genres$: BehaviorSubject<GenreModel[]> = new BehaviorSubject<GenreModel[]>(null);
  public topArtists$: BehaviorSubject<ITopArtists> = new BehaviorSubject<ITopArtists>(null);
  public playlists$: BehaviorSubject<PlaylistObjectSimplified[]> = new BehaviorSubject<PlaylistObjectSimplified[]>(null);
  public recommendedSongs$: BehaviorSubject<TrackObjectSimplified[]> = new BehaviorSubject<TrackObjectSimplified[]>(null);
  private savedTracks$: BehaviorSubject<SavedTrackObject[]> = new BehaviorSubject<SavedTrackObject[]>(null);

  constructor(private api: SpotifyApiService, private user: UserService) {}

  public initStats() {
    this.getTopArtistsForAllTerms();
    this.getGenreStats().then();
    this.findDiscoverPlaylist().then();
    this.playlists$.subscribe((res) => console.log(res));
  }

  public initRecommendations() {}

  private getTopArtistsForAllTerms(): void {
    const forkObj = topArtistsTerms.reduce((acc, term) => {
      acc = {
        ...acc,
        ...{
          [`${term}`]: this.api.getTopArtists({ time_range: term }).pipe(map((res) => res.items)),
        },
      };
      return acc;
    }, {});

    forkJoin(forkObj).subscribe((result: ITopArtists) => {
      this.topArtists$.next(result);
    });
  }

  private async getGenreStats(): Promise<void> {
    this.savedTracks$.next(await this.getAllSavedTracks());
    if (!this.savedTracks$.value.length) {
      return;
    }
    this.genres$.next(this.createGenreList(await this.getArtistsWithTracksAndGenres()));
  }

  private async getAllSavedTracks(): Promise<SavedTrackObject[]> {
    return this.getAllItemsFromListOfUnknownLength(this.api.getSavedTracks.bind(this.api));
  }

  private async getArtistsWithTracksAndGenres(): Promise<IArtistWithTracksAndGenres[]> {
    const artistsWithTracks = this.createArtistsWithTracksArray();
    const artistsWithGenres = await this.getAllArtistsByIds(artistsWithTracks.map((artist) => artist.id));
    return artistsWithTracks.map((artistWithTracks, i) => {
      return { ...artistWithTracks, genres: artistsWithGenres[i].genres };
    });
  }

  private createArtistsWithTracksArray(): IArtistWithTracks[] {
    return this.savedTracks$.value.reduce((artistsWithTracks: IArtistWithTracks[], currentSavedTrack) => {
      currentSavedTrack.track.artists.forEach((artist) => {
        const i = artistsWithTracks.findIndex((artistWithTracks) => artistWithTracks.name === artist.name);
        if (i > -1) {
          artistsWithTracks[i].tracks.push(currentSavedTrack.track);
        } else {
          artistsWithTracks.push({ ...artist, tracks: [currentSavedTrack.track] });
        }
      });
      return artistsWithTracks;
    }, []);
  }

  private async getAllArtistsByIds(ids: string[]): Promise<ArtistObjectFull[]> {
    const offsetArray = [];
    for (let i = 0; i < ids.length; i = i + 50) {
      offsetArray.push(i);
    }
    return Promise.all(
      offsetArray.map((offset) =>
        this.api
          .getArtistsInformation({ ids: ids.slice(offset, offset + 50) })
          .pipe(map((res) => res.artists))
          .toPromise()
      )
    ).then((res) =>
      res.reduce((acc, curr) => {
        acc.push(...curr);
        return acc;
      }, [])
    );
  }

  private createGenreList(artists: IArtistWithTracksAndGenres[]): GenreModel[] {
    return artists
      .reduce((genreList: GenreModel[], currentArtist) => {
        currentArtist.genres.forEach((genre) => {
          const i = genreList.findIndex((genreModel) => genreModel.name === genre);
          if (i > -1) {
            genreList[i].addArtist(currentArtist);
            genreList[i].tracks.push(...currentArtist.tracks.map((track) => new TrackModel(track)));
          } else {
            genreList.push(new GenreModel(genre, currentArtist));
          }
        });
        return genreList;
      }, [])
      .sort((a, b) => b.tracks.length - a.tracks.length);
  }

  private async findDiscoverPlaylist(): Promise<void> {
    this.playlists$.next(await this.getAllPlaylists());
    const discoverPlaylistIndex = this.playlists$.value.findIndex((p) => p.name === 'Discover Daily');
    this.discoverPlaylistId = discoverPlaylistIndex > -1 ? this.playlists$.value[discoverPlaylistIndex].id : null;
  }

  private async getAllPlaylists(): Promise<PlaylistObjectSimplified[]> {
    return this.getAllItemsFromListOfUnknownLength(this.api.getCurrentUserPlaylist.bind(this.api));
  }

  private async getAllItemsFromListOfUnknownLength(
    f: (obj: IQueryParams, ...someArgs) => Observable<PagingObject<any>>,
    ...args
  ): Promise<any[]> {
    const total = await f({ offset: 0, limit: 50 }, ...args)
      .toPromise()
      .then((res) => res.total);
    const offsetArray = [];
    for (let i = 0; i < total; i = i + 50) {
      offsetArray.push(i);
    }
    return Promise.all(
      offsetArray.map((offsetItem) =>
        f(
          {
            offset: offsetItem,
            limit: 50,
          },
          ...args
        )
          .pipe(
            catchError(() => of({ items: [] })),
            map((res) => res.items)
          )
          .toPromise()
      )
    ).then((res) =>
      res.reduce((acc, curr) => {
        acc.push(...curr);
        return acc;
      }, [])
    );
  }

  private async getRecommendation(count: number = 30, selectedGenres?: GenreModel[], filter?) {
    this.recommendationStatus = `Search started`;
    return await this.getAllRecommendedTracks(count, selectedGenres, filter);
  }

  private async addTracksToPlaylist(recommendedTracks, user) {
    let playlist;
    if (!this.discoverPlaylistId) {
      const body = {
        name: 'Discover Daily',
        description: 'Created with «Discover Daily» https://chuchitrii.github.io/discover-daily',
      };
      playlist = await this.api.createPlaylist(body, user).toPromise();
      this.discoverPlaylistId = playlist.id;
    }
    await this.uploadPlaylistCover(this.discoverPlaylistId);
    // if (clear) {
    this.recommendationStatus = `Tracks have been added to your «Discover Daily» playlist`;
    return await this.api
      .replaceTracksInPlaylist({ uris: recommendedTracks.map((track) => track.uri) }, this.discoverPlaylistId)
      .toPromise();
    // } else {
    //   this.recommendationStatus = `Tracks have been added to your «Discover Daily» playlist`;
    //   return await this.api.postTracksToPlaylist(queryParams, this.discoverPlaylistId).toPromise();
    // }
  }

  private async getAllRecommendedTracks(
    count = 30,
    selectedGenres?: GenreModel[],
    filter?: Partial<RecommendationsOptionsObject>
  ): Promise<TrackObjectSimplified[]> {
    const queryParams = { limit: 100, seed_tracks: [] };
    const recommendedTracks: SetOfObjects = new SetOfObjects();
    let notEnoughTracks: boolean;

    if (selectedGenres.length > 0) {
      let recommendationGenres = selectedGenres.map((selectedGenre) => new GenreForRecommendation(selectedGenre));
      await this.fillRecommendationsGenres({ ...queryParams, ...filter }, recommendationGenres);
      const quantity = Math.floor(count / recommendationGenres.length);
      do {
        if (!recommendationGenres.length) {
          notEnoughTracks = true;
          continue;
        }
        for (const genre of recommendationGenres) {
          if (!genre.tracksFromResponse.length) {
            await this.fillRecommendationsGenres({ ...queryParams, ...filter }, [genre]);
          }
          if (genre.toDelete) {
            continue;
          }
          genre.tracksFromResponse.splice(0, quantity).forEach((track) => recommendedTracks.add(track));
          this.recommendationStatus = `Searching tracks for you. Found ${recommendedTracks.size} tracks out of 30...`;
        }
        recommendationGenres = this.clearRecommendationGenres(recommendationGenres);
      } while (!notEnoughTracks && recommendedTracks.size < count);
    } else {
      queryParams.limit = 5;
      do {
        queryParams.seed_tracks = Array(5)
          .fill(this.getRandomInt(this.savedTracks.length))
          .map((i) => this.savedTracks[i].track.id);
        const res = await this.api.getRecommendedTracks({ ...queryParams, ...filter }).toPromise();
        const filtered = await this.filterTracks(res.tracks);
        filtered.forEach((track) => recommendedTracks.add(track));
      } while (recommendedTracks.size < count);
    }
    this.recommendationStatus = 'Search completed';
    return Array.from(recommendedTracks);
  }

  private async fillRecommendationsGenres(q, genres: IGenreForRecommendation[]) {
    for (const genre of genres) {
      q.seed_tracks = [];
      if (genre.tracksForRequest.length <= 5 && genre.tracksForRequest.length > 0) {
        q.seed_tracks.push(...genre.tracksForRequest);
        genre.tracksForRequest = [];
      } else if (genre.tracksForRequest.length > 5) {
        for (let i = 0; i < 5; i++) {
          q.seed_tracks.push(genre.tracksForRequest.splice(this.getRandomInt(genre.tracksForRequest.length), 1));
        }
      } else {
        genre.toDelete = true;
        continue;
      }
      const res = await this.api.getRecommendedTracks(q).toPromise();
      const filtered = res?.tracks?.length ? await this.filterTracks(res.tracks) : [];
      genre.tracksFromResponse.push(...filtered);
    }
  }

  private clearRecommendationGenres(recommendationGenres): GenreForRecommendation[] {
    return recommendationGenres.filter((genre) => !genre.toDelete);
  }

  private async filterTracks(tracks: TrackObjectSimplified[]) {
    const mask = await this.api.getFilterMask({ ids: tracks.map((t) => t.id) }).toPromise();
    return tracks.filter((x, i) => !mask[i]);
  }

  private getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  private async uploadPlaylistCover(playlistId: string) {
    return await this.api.uploadPlaylistCover(images[this.getRandomInt(images.length)], playlistId).toPromise();
  }
}
