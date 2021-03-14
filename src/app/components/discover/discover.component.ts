import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../../services/spotify-api/spotify-api.service';
import { DiscoverService } from '../../services/discover/discover.service';
import { TrackObjectSimplified, UserObjectPublic } from '../../models/spotify-api';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
})
export class DiscoverComponent implements OnInit {
  recommendedTracks: TrackObjectSimplified[] = [];
  genres: any = [];
  user: UserObjectPublic;
  playlistId: string;

  clear = false;
  recommendationsFound = false;
  gettingRecommendations = false;
  searchingPlaylistEnded = false;
  playlistFound = false;
  tracksAdded = false;

  constructor(private ds: DiscoverService, private api: SpotifyApiService) {}

  ngOnInit(): void {
    this.ds.getUserProfile().then((user) => {
      this.user = user;
    });
    this.getGenres();
  }

  getGenres(): void {
    this.ds.getGenres().then((genres) => this.genres.push(...genres));
  }

  getRecommendedTracks(): void {
    this.tracksAdded = false;
    this.gettingRecommendations = true;
    this.recommendationsFound = false;
    this.findPlaylist();
    this.recommendedTracks = [];
    this.ds.getRecommendation().then((r) => {
      this.recommendedTracks.push(...r);
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
    this.ds.findDiscoverPlaylist(this.user).then((pl) => {
      if (pl) {
        this.playlistId = pl;
        this.playlistFound = true;
      } else {
        this.playlistFound = false;
      }
      this.searchingPlaylistEnded = true;
    });
  }

  clearChange(): void {
    this.clear = !this.clear;
  }
}
