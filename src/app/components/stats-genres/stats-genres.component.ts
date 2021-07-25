import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { GenreModel, TopArtistsTerms } from '../../models/discover.model';
import { FormControl } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-stats-genres',
  templateUrl: './stats-genres.component.html',
  styleUrls: ['./stats-genres.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsGenresComponent implements OnInit, OnDestroy {
  @Input() genres: GenreModel[];
  @Output() genreSearch = new EventEmitter<string>();
  searchFormControl: FormControl = new FormControl();
  destroySub: Subject<void> = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    this.searchFormControl.valueChanges.pipe(takeUntil(this.destroySub), debounceTime(300)).subscribe((search: string) => {
      this.genreSearch.emit(search);
    });
  }

  ngOnDestroy(): void {
    this.destroySub.next();
  }
}
