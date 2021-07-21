import { Component, OnInit } from '@angular/core';
import { DiscoverService } from '../../services/discover/discover.service';
import { TrackObjectSimplified, UserObjectPublic } from '../../models/spotify-api';
import { GenreModel, RecommendationsOptions } from '../../models/discover.model';
import { ActivatedRoute } from '@angular/router';
import { DeviceService } from '../../services/device/device.service';
import { DiscoverTabs } from './discoverTabs';
import { filtersConfig, FiltersConfig } from '../search-filters-pretty/filters-config.model';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscoverComponent implements OnInit {
  recommendedTracks: TrackObjectSimplified[] = [];
  genres: GenreModel[] = [];
  user: UserObjectPublic;
  filters: any = new RecommendationsOptions();
  prettyMode = true;
  genresLoaded: boolean;
  filtersConfig: FiltersConfig[] = filtersConfig;
  tabVisibility: { [key in DiscoverTabs]: boolean } = {
    genre: true,
    filter: false,
    playlist: false,
  };

  constructor(public ds: DiscoverService, public device: DeviceService, private route: ActivatedRoute) {}

  async ngOnInit(): Promise<void> {
    this.genresLoaded = false;
    this.getGenres();
    await this.findPlaylist();
  }

  getGenres(): void {
    this.ds.getGenres().then((genres) => {
      this.genres = [...genres];
      this.genresLoaded = true;
    });
  }

  getRecommendedTracks(): void {
    this.changeTab('playlist');
    this.recommendedTracks = [];
    this.genres.filter((genre) => genre.isSelected);
    this.ds
      .getRecommendation(
        30,
        this.genres.filter((genre) => genre.isSelected),
        this.filters
      )
      .then((r) => {
        console.log(r);
        this.recommendedTracks = [...r];
      });
  }

  addTracksToPlaylist(): void {
    this.ds.addTracksToPlaylist(this.recommendedTracks, this.user).then((res) => {
      this.recommendedTracks = [];
    });
  }

  async findPlaylist(): Promise<void> {
    await this.ds.findDiscoverPlaylist();
  }

  changeTab(tab: 'genre' | 'filter' | 'playlist') {
    Object.keys(this.tabVisibility).forEach((tabName) => (this.tabVisibility[tabName] = tab === tabName));
  }

  clearGenres() {
    this.genres.forEach((genre) => {
      genre.isSelected = false;
    });
    this.genres = [...this.genres];
  }

  clearFilters() {
    Object.keys(this.filters).forEach((key) => {
      this.filters[key] = null;
    });
    this.filtersConfig.forEach((c) => {
      if (c.toggle) c.toggle.yes.pressed = false;
      if (c.toggle) c.toggle.no.pressed = false;
    });
    this.filtersConfig = [...this.filtersConfig];
  }

  toggleSearchMode(): void {
    this.prettyMode = !this.prettyMode;
  }
}
