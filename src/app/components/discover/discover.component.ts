import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../../services/spotify-api/spotify-api.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
})
export class DiscoverComponent implements OnInit {
  savedTracks: unknown[] = [];
  userId: 'string' = null;
  user: any;

  constructor(private api: SpotifyApiService) {}

  ngOnInit(): void {
    this.getUserProfile()
      .pipe(take(1))
      .subscribe((res) => {
        this.user = res;
      });
    // this.getRecommendations());
    // console.log(this.savedTracks);
  }

  async getRecommendations() {
    const result = await this.api.main(this.userId);
    this.savedTracks = result;
  }

  getUserProfile() {
    return this.api.getUserProfile();
  }
}
