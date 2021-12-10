import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StatsService } from '../../services/stats/stats.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StatsService],
})
export class StatsComponent implements OnInit {
  @ViewChild('genreContainer', { static: true }) genreContainer: ElementRef;

  constructor(public s: StatsService) {}

  ngOnInit(): void {}

  onGenreSearch($event: string) {
    this.s.genresFilter$.next($event);
    window.scroll({ top: this.genreContainer.nativeElement.getBoundingClientRect().top + window.scrollY, left: 0, behavior: 'smooth' });
  }
}
