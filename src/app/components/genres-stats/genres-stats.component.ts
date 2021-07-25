import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { GenreModel } from '../../models/discover.model';
import { DiscoverService } from '../../services/discover/discover.service';

@Component({
  selector: 'app-genres-stats',
  templateUrl: './genres-stats.component.html',
  styleUrls: ['./genres-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenresStatsComponent implements OnInit {
  @Input() genreList: GenreModel[];
  helpVisible = true;

  constructor(public ds: DiscoverService) {}

  ngOnInit() {}

  selectGenre(genre: GenreModel) {
    genre.isSelected = true;
  }

  unselectGenre(genre: GenreModel) {
    genre.isSelected = false;
  }
}
