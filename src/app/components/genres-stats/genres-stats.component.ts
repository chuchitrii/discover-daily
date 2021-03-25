import { Component, OnInit, Input } from '@angular/core';
import { GenreModel } from '../../models/discover.model';
import { DiscoverService } from '../../services/discover/discover.service';

@Component({
  selector: 'app-genres-stats',
  templateUrl: './genres-stats.component.html',
  styleUrls: ['./genres-stats.component.scss'],
})
export class GenresStatsComponent implements OnInit {
  @Input() genreList: GenreModel[] = [];
  selectedGenres: GenreModel[] = [];

  constructor(public ds: DiscoverService) {}

  ngOnInit() {
    console.log(this.genreList);
  }

  selectGenre(genre: GenreModel) {
    console.log(genre);
    genre.isSelected = true;
    this.selectedGenres.push(genre);
  }

  unselectGenre(genre: GenreModel) {
    genre.isSelected = false;
    this.selectedGenres.splice(this.selectedGenres.indexOf(genre), 1);
  }
}
