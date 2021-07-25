import { Injectable } from '@angular/core';
import { DiscoverService } from '../discover/discover.service';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { GenreModel, ITopArtists } from '../../models/discover.model';
import { map, startWith, tap } from 'rxjs/operators';

@Injectable()
export class StatsService {
  genres$: Observable<GenreModel[]> = new Observable<GenreModel[]>();
  genresFilter$: Subject<string> = new Subject<string>();
  topArtists$: BehaviorSubject<ITopArtists> = new BehaviorSubject<ITopArtists>(null);

  constructor(private d: DiscoverService) {
    this.topArtists$ = this.d.topArtists$;
    this.genres$ = combineLatest([
      this.d.genres$,
      this.genresFilter$.pipe(
        startWith(''),
        tap((res) => console.log('searchString', res))
      ),
    ]).pipe(map(([genres, searchString]) => this.filterGenres(genres, searchString)));
  }

  public init() {
    this.d.initStats();
  }

  private filterGenres(genres: GenreModel[], searchString): GenreModel[] {
    if (!genres) return null;
    if (!searchString) return genres;
    return genres.filter((genre) => genre.name.includes(searchString));
  }
}
