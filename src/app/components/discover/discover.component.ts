import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../../services/spotify-api/spotify-api.service';
import { DiscoverService } from '../../services/discover/discover.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
})
export class DiscoverComponent implements OnInit {
  recommendedTracks: unknown[] = [];
  user: any;
  playlistId: string;
  clear = false;
  gettingRecommendations: boolean;
  searchingPlaylist: boolean;
  playlistFound: boolean;

  constructor(private ds: DiscoverService, private api: SpotifyApiService) {}

  ngOnInit(): void {
    this.ds.getUserProfile().then((user) => {
      console.log(user);
      this.user = user;
    });
  }

  getRecommendedTracks(): void {
    this.gettingRecommendations = true;
    this.ds.getRecommendation().then((r) => {
      console.log(r);
      this.recommendedTracks.push(...r);
      this.gettingRecommendations = false;
    });
    this.findPlaylist();
  }

  addTracksToPlaylist() {
    this.ds
      .addTracksToPlaylist(this.recommendedTracks, this.user, this.clear, this.playlistId)
      .then((res) => {});
  }

  findPlaylist() {
    this.searchingPlaylist = true;
    this.ds.findDiscoverPlaylist(this.user).then((pl) => {
      if (pl) {
        this.playlistId = pl;
        this.playlistFound = true;
      } else {
        this.playlistFound = false;
      }
      this.searchingPlaylist = false;
    });
  }
}
