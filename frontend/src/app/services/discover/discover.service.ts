import { Injectable } from '@angular/core';
import { SpotifyApiService } from '../spotify-api/spotify-api.service';
import { images } from '../../models/images';
import {
  ArtistObjectFull,
  ICreatePlaylist,
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
import { BehaviorSubject, defer, forkJoin, iif, merge, MonoTypeOperatorFunction, Observable, of, pipe, Subject } from 'rxjs';
import { catchError, endWith, first, map, mapTo, share, startWith, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { ITopArtists } from 'src/app/models/discover.model';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class DiscoverService {
  public getRecommendationsSubject: Subject<void> = new Subject<void>();
  public addTracksToPlaylistSubject: Subject<void> = new Subject<void>();
  public topArtists$: Observable<ITopArtists>;
  public savedTracks$: Observable<SavedTrackObject[]>;
  public genres$: Observable<GenreModel[]>;
  public recommendedSongs$: Observable<TrackObjectSimplified[]>;
  public playlists$: Observable<PlaylistObjectSimplified[]>;
  private topArtistsSubject: BehaviorSubject<ITopArtists> = new BehaviorSubject<ITopArtists>(null);
  private savedTracksSubject: BehaviorSubject<SavedTrackObject[]> = new BehaviorSubject<SavedTrackObject[]>(null);
  private genresSubject: BehaviorSubject<GenreModel[]> = new BehaviorSubject<GenreModel[]>(null);
  private recommendedSongsSubject: BehaviorSubject<TrackObjectSimplified[]> = new BehaviorSubject<TrackObjectSimplified[]>(null);
  private playlistsSubject: BehaviorSubject<PlaylistObjectSimplified[]> = new BehaviorSubject<PlaylistObjectSimplified[]>(null);

  private get topArtists() {
    return this.topArtistsSubject.value;
  }

  private get savedTracks() {
    return this.savedTracksSubject.value;
  }

  private get genres() {
    return this.genresSubject.value;
  }

  private get recommendedSongs() {
    return this.recommendedSongsSubject.value;
  }

  private get playlists() {
    return this.playlistsSubject.value;
  }

  private discoverPlaylistId: string;
  private playlistDescription: ICreatePlaylist = {
    name: 'Discover Daily',
    description: 'Created with «Discover Daily» https://chuchitrii.github.io/discover-daily',
  };

  constructor(private api: SpotifyApiService, private user: UserService) {
    this.topArtists$ = defer(() => (this.topArtists ? this.topArtistsSubject : this.getTopArtists())).pipe(share());
    this.savedTracks$ = defer(() => (this.savedTracks ? this.savedTracksSubject : this.getAllSavedTracks())).pipe(share());
    this.genres$ = defer(() => (this.genres ? this.genresSubject : this.getGenreStats())).pipe(share());
    this.playlists$ = defer(() => (this.playlists ? this.playlistsSubject : this.getAllPlaylists())).pipe(share());
    this.recommendedSongs$ = this.getRecommendationsSubject
      .pipe(
        startWith('start'),
        switchMap((res) =>
          iif(
            () => !!res,
            this.recommendedSongs ? this.recommendedSongsSubject : this.getRecommendedSongsByAllSongsAndCheckSavedSongs(),
            this.getRecommendedSongsByAllSongsAndCheckSavedSongs()
          )
        )
      )
      .pipe(share());
  }

  public clear(): void {
    this.discoverPlaylistId = null;
    Object.values(this).forEach((value) => {
      if (value instanceof BehaviorSubject) {
        value.next(null);
      }
    });
  }

  public addTracksToPlaylist() {
    console.log('addTracks 1');
    return iif(
      () => {
        console.log('addTracks 2');
        return !!this.discoverPlaylistId;
      },
      of(null),
      this.api.createPlaylist(this.playlistDescription, this.user.id).pipe(
        map((playlist) => playlist.id),
        tap((playlistId) => (this.discoverPlaylistId = playlistId)),
        switchMap((playlistId) => this.uploadPlaylistCover(playlistId))
      )
    ).pipe(
      switchMap(() => this.api.replaceTracksInPlaylist({ uris: this.recommendedSongs.map((track) => track.uri) }, this.discoverPlaylistId))
    );
  }

  // A little helper for the loading state
  // Remember to add share() to Observables
  // that are used to end loading
  public loading(start: readonly Observable<unknown>[], finish: readonly Observable<unknown>[]) {
    // Listen to all triggers
    return merge(...start).pipe(
      switchMapTo(
        // Wait for result
        merge(...finish).pipe(
          // We only need first result
          first(),
          // End loading upon emit
          mapTo(false),
          // Start loading immediately
          startWith(true)
        )
      )
    );
  }

  // A little helper for add/remove operations
  // to be used with "combineLatest" later
  public wrap<T>(func: (item: T) => Observable<T>): MonoTypeOperatorFunction<T> {
    return pipe(
      // Switch to actual operation
      switchMap((item) =>
        func(item).pipe(
          // Remove item from upcoming "combineLatest" emits
          endWith(null),
          // null and not EMPTY so we can stop loading upon error
          catchError(() => of(null))
        )
      ),
      // Kickstart "combineLatest"
      startWith(null)
    );
  }

  private getTopArtists(): Observable<ITopArtists> {
    return this.getTopArtistsForAllTerms().pipe(tap((topArtists) => this.topArtistsSubject.next(topArtists)));
  }

  private getTopArtistsForAllTerms(): Observable<ITopArtists> {
    const forkObj = topArtistsTerms.reduce((acc, term) => {
      acc = {
        ...acc,
        ...{
          [`${term}`]: this.api.getTopArtists({ time_range: term }).pipe(map((res) => res.items)),
        },
      };
      return acc;
    }, {});
    return forkJoin(forkObj);
  }

  private getAllSavedTracks(): Observable<SavedTrackObject[]> {
    return this.getAllItemsFromListOfUnknownLength(this.api.getSavedTracks.bind(this.api)).pipe(
      tap((res) => this.savedTracksSubject.next(res))
    );
  }

  private getGenreStats(): Observable<GenreModel[]> {
    return this.savedTracks
      ? this.getArtistsWithTracksAndGenres().pipe(
          map((artistsWithTracksAndGenres) => this.createGenreList(artistsWithTracksAndGenres)),
          tap((genres) => this.genresSubject.next(genres))
        )
      : this.getAllSavedTracks().pipe(
          switchMap(() =>
            this.getArtistsWithTracksAndGenres().pipe(
              map((artistsWithTracksAndGenres) => this.createGenreList(artistsWithTracksAndGenres)),
              tap((genres) => this.genresSubject.next(genres))
            )
          )
        );
  }

  private getArtistsWithTracksAndGenres(): Observable<IArtistWithTracksAndGenres[]> {
    return of(this.createArtistsWithTracksArray()).pipe(
      switchMap((artistsWithTracks) =>
        this.getAllArtistsByIds(artistsWithTracks.map((a) => a.id)).pipe(
          map((artistsWithGenres) => this.mapArtistsWithTracksAndGenres(artistsWithGenres, artistsWithTracks))
        )
      )
    );
  }

  private mapArtistsWithTracksAndGenres(artistsWithGenres: ArtistObjectFull[], artistsWithTracks: IArtistWithTracks[]) {
    return artistsWithTracks.map((artistWithTracks, i) => {
      return { ...artistWithTracks, genres: artistsWithGenres[i].genres };
    });
  }

  private createArtistsWithTracksArray(): IArtistWithTracks[] {
    return this.savedTracksSubject.value.reduce((artistsWithTracks: IArtistWithTracks[], currentSavedTrack) => {
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

  private getAllArtistsByIds(ids: string[]): Observable<ArtistObjectFull[]> {
    return forkJoin(
      this.getOffsetArray(ids.length).map((offset) =>
        this.api.getArtistsInformation({ ids: ids.slice(offset, offset + 50) }).pipe(map((res) => res.artists))
      )
    ).pipe(map((arrayOfArrays) => [].concat(...arrayOfArrays)));
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

  private findDiscoverPlaylist(): void {
    if (!this.playlists) {
      return;
    }
    const discoverPlaylistIndex = this.playlistsSubject.value.findIndex((p) => p.name === 'Discover Daily');
    this.discoverPlaylistId = discoverPlaylistIndex > -1 ? this.playlistsSubject.value[discoverPlaylistIndex].id : null;
  }

  private getAllPlaylists(): Observable<PlaylistObjectSimplified[]> {
    return this.getAllItemsFromListOfUnknownLength(this.api.getCurrentUserPlaylist.bind(this.api)).pipe(
      tap((playlists) => this.playlistsSubject.next(playlists)),
      tap(() => this.findDiscoverPlaylist())
    );
  }

  private getAllItemsFromListOfUnknownLength<T>(
    f: (obj: IQueryParams, ...someArgs) => Observable<PagingObject<T>>,
    ...args
  ): Observable<T[]> {
    return f({ offset: 0, limit: 1 }, ...args).pipe(
      map((res: PagingObject<T>) => this.getOffsetArray(res.total)),
      map((offsetArray) => this.getObservablesArray<T>(offsetArray, f, ...args)),
      switchMap((observablesArray) => forkJoin(...observablesArray)),
      map((arrayOfItemArrays) => [].concat(...arrayOfItemArrays))
    );
  }

  private getOffsetArray(total: number): number[] {
    return Array.from({ length: Math.ceil(total / 50) }, (_, i) => i * 50);
  }

  private getObservablesArray<T>(
    offsetArray: number[],
    f: (obj: IQueryParams, ...someArgs) => Observable<PagingObject<T>>,
    ...args
  ): Observable<T[]>[] {
    return offsetArray.map((offsetItem) =>
      f(
        {
          offset: offsetItem,
          limit: 50,
        },
        ...args
      ).pipe(
        catchError(() => of({ items: [] } as { items: T[] })),
        map((res) => res.items)
      )
    );
  }

  private async getAllRecommendedTracks(
    count = 30,
    selectedGenres?: GenreModel[],
    filter?: Partial<RecommendationsOptionsObject>
  ): Promise<TrackObjectSimplified[]> {
    const queryParams = { limit: 100, seed_tracks: [] };
    const recommendedTracks: SetOfObjects = new SetOfObjects();
    let notEnoughTracks: boolean;

    if (selectedGenres?.length > 0) {
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
          const tracksToAdd = genre.tracksFromResponse.length >= quantity ? quantity : genre.tracksFromResponse.length;
          for (let i = 0; i < tracksToAdd; i++) {
            recommendedTracks.add(genre.tracksFromResponse.pop());
          }
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
    return Array.from(recommendedTracks);
  }

  private getTracksAndFilterSaved(queryParams: RecommendationsOptionsObject) {
    return this.api.getRecommendedTracks(queryParams).pipe(switchMap((recObj) => this.filterTracks(recObj.tracks)));
  }

  private getRecommendedSongsByAllSongsAndCheckSavedSongs() {
    return defer(() =>
      this.savedTracks
        ? this.getRecommendedSongsByAllSongs()
        : this.getAllSavedTracks().pipe(switchMap(() => this.getRecommendedSongsByAllSongs()))
    );
  }

  private getRecommendedSongsByAllSongs() {
    const limit = 50;
    const playlistLength = 30;
    const count = playlistLength / 5;
    return of(Array(count).fill(null)).pipe(
      switchMap((array) =>
        forkJoin(
          array.map(() =>
            this.getTracksAndFilterSaved({
              limit,
              seed_tracks: this.getArrayOfRandomSavedTrackIds(5),
            })
          )
        ).pipe(
          map((arrayOfItemArrays) =>
            [].concat(
              ...arrayOfItemArrays.map((recommendedSongs) => {
                recommendedSongs.length = Math.min(5, recommendedSongs.length);
                return recommendedSongs;
              })
            )
          ),
          switchMap((recommendedSongs) => of(this.recommendedSongsSubject.next(recommendedSongs)).pipe(mapTo(recommendedSongs)))
        )
      )
    );
  }

  private getArrayOfRandomSavedTrackIds(count: number): string[] {
    return Array(count)
      .fill(this.getRandomInt(this.savedTracks.length))
      .map((i) => this.savedTracks[i].track.id);
  }

  private async fillRecommendationsGenres(q, genres: IGenreForRecommendation[]) {
    const observablesArray: Observable<TrackObjectSimplified[]>[] = [];
    for (const genre of genres) {
      q.seed_tracks = [];
      if (genre.tracksForRequest.length > 0) {
        const count = genre.tracksForRequest.length > 5 ? 5 : genre.tracksForRequest.length;
        for (let i = 0; i < count; i++) {
          q.seed_tracks.push(genre.tracksForRequest.pop());
        }
      } else {
        genre.toDelete = true;
        continue;
      }
      observablesArray.push(this.api.getRecommendedTracks(q).pipe(switchMap((recObj) => this.filterTracks(recObj.tracks))));
    }
    await forkJoin(observablesArray)
      .pipe(tap((array) => array.forEach((tracks, i) => genres[i].tracksFromResponse.push(...tracks))))
      .toPromise();
  }

  private clearRecommendationGenres(recommendationGenres): GenreForRecommendation[] {
    return recommendationGenres.filter((genre) => !genre.toDelete);
  }

  private filterTracks(tracks: TrackObjectSimplified[]): Observable<TrackObjectSimplified[]> {
    return tracks?.length
      ? this.api.getFilterMask({ ids: tracks.map((t) => t.id) }).pipe(map((mask) => tracks.filter((x, i) => !mask[i])))
      : of([]);
  }

  private getRandomInt(max: number): number {
    return Math.floor(Math.random() * Math.floor(max));
  }

  private uploadPlaylistCover(playlistId: string) {
    return this.api.uploadPlaylistCover(images[this.getRandomInt(images.length)], playlistId);
  }
}
