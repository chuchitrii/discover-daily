import { Component, OnInit } from '@angular/core';
import { DiscoverService } from '../../services/discover/discover.service';
import { TrackObjectSimplified, UserObjectPublic } from '../../models/spotify-api';
import { GenreModel, RecommendationsOptions } from '../../models/discover.model';
import { ActivatedRoute } from '@angular/router';
import { DeviceService } from '../../services/device/device.service';
import { DiscoverTabs } from './discoverTabs';
import { filtersConfig, FiltersConfig } from '../search-filters-pretty/filters-config.model';
import { config } from 'rxjs';

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
  playlistId: string;
  filters: any = new RecommendationsOptions();
  prettyMode = true;
  genresLoaded: boolean;
  clear = false;
  recommendationsFound = false;
  gettingRecommendations = false;
  searchingPlaylistEnded = false;
  playlistFound = false;
  tracksAdded = false;
  filtersConfig: FiltersConfig[] = filtersConfig;
  tabVisibility: { [key in DiscoverTabs]: boolean } = {
    genre: false,
    filter: false,
    playlist: true,
  };

  constructor(public ds: DiscoverService, public device: DeviceService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    console.log(this.device.isMobile());
    this.genresLoaded = false;
    this.getGenres();
  }

  getGenres(): void {
    this.ds.getGenres().then((genres) => {
      this.genres = [...genres];
      this.genresLoaded = true;
    });
  }

  getRecommendedTracks(): void {
    this.changeTab('playlist');
    this.tracksAdded = false;
    this.gettingRecommendations = true;
    this.recommendationsFound = false;
    this.findPlaylist();
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
        this.gettingRecommendations = false;
        this.recommendationsFound = true;
      });
  }

  addTracksToPlaylist(): void {
    this.ds.addTracksToPlaylist(this.recommendedTracks, this.user, this.clear, this.playlistId).then((res) => {
      this.recommendedTracks = [];
      this.recommendationsFound = false;
      this.tracksAdded = true;
    });
  }

  findPlaylist(): void {
    this.searchingPlaylistEnded = false;
    this.ds.findDiscoverPlaylist().then((pl) => {
      if (pl) {
        this.playlistId = pl;
        this.playlistFound = true;
      } else {
        this.playlistFound = false;
      }
      this.searchingPlaylistEnded = true;
    });
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

  clearChange(): void {
    this.clear = !this.clear;
  }

  toggleSearchMode(): void {
    this.prettyMode = !this.prettyMode;
  }
}
