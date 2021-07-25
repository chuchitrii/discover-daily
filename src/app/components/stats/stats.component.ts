import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StatsService } from '../../services/stats/stats.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StatsService],
})
export class StatsComponent implements OnInit, AfterViewInit {
  @ViewChild('genreContainer', { static: true }) genreContainer: ElementRef;
  genreContainerDomRect: DOMRectReadOnly;

  constructor(public s: StatsService) {
    s.init();
  }

  ngOnInit(): void {}

  onGenreSearch($event) {
    window.scroll({ top: this.genreContainerDomRect.top, left: 0, behavior: 'smooth' });
    this.s.genresFilter$.next($event);
  }

  ngAfterViewInit(): void {
    this.genreContainerDomRect = this.genreContainer.nativeElement.getBoundingClientRect();
  }
}
