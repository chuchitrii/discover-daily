import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { ITopArtists, topArtistsTerms, TopArtistsTerms } from '../../models/discover.model';

@Component({
  selector: 'app-stats-top-artists',
  templateUrl: './stats-top-artists.component.html',
  styleUrls: ['./stats-top-artists.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsTopArtistsComponent implements OnInit {
  @ViewChild('artistsContainer') artistsContainer: ElementRef;

  @Input() topArtists: ITopArtists;
  topArtistsTerms = topArtistsTerms;
  currentTerm: TopArtistsTerms = 'long_term';
  termLabels: { [key in TopArtistsTerms]: string } = {
    short_term: 'weeks',
    medium_term: 'months',
    long_term: 'years',
  };

  constructor() {}

  ngOnInit(): void {}

  changeTerm(term: TopArtistsTerms) {
    window.scroll({ top: 0, left: 0, behavior: 'smooth' });
    this.artistsContainer.nativeElement.scroll({ top: 0, left: 0, behavior: 'smooth' });
    this.currentTerm = term;
  }
}
