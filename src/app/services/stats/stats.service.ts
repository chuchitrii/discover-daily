import { Injectable } from '@angular/core';
import { DiscoverService } from '../discover/discover.service';
import { combineLatest, Observable, Subject } from 'rxjs';
import { GenreModel, ITopArtists } from '../../models/discover.model';
import { map, startWith, tap } from 'rxjs/operators';

@Injectable()
export class StatsService {
  public genresFilter$: Subject<string> = new Subject<string>();
  public genres$: Observable<GenreModel[]> = combineLatest([this.d.genres$, this.genresFilter$.pipe(startWith(''))]).pipe(
    map(([genres, searchString]) => this.filterGenres(genres, searchString))
  );

  public get topArtists$(): Observable<ITopArtists> {
    return this.d.topArtists$;
  }

  constructor(private d: DiscoverService) {}

  private filterGenres(genres: GenreModel[], searchString): GenreModel[] {
    if (!genres) {
      return null;
    }
    if (!searchString) {
      return genres;
    }
    return genres.filter((genre) => genre.name.includes(searchString));
  }
}
