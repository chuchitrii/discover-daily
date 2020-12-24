import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../../services/spotify-api/spotify-api.service';
import { take } from 'rxjs/operators';
import { DiscoverService } from '../../services/discover/discover.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
})
export class DiscoverComponent implements OnInit {
  recommendedTracks: unknown[] = [];
  savedTracks: unknown[] = [];
  user: any;

  constructor(private ds: DiscoverService, private api: SpotifyApiService) {}

  ngOnInit(): void {
    this.ds.getUserProfile().then((user) => {
      console.log(user);
      this.user = user;
    });
  }

  getRecommendedTracks(): void {
    this.ds.getRecommendation().then((r) => {
      console.log(r);
      this.recommendedTracks.push(...r);
    });
  }

  addTracksToPlaylist() {
    this.ds.addTracksToPlaylist(this.recommendedTracks, this.user);
  }
}
