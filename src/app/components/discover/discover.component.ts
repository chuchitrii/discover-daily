import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../../services/spotify-api/spotify-api.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.scss'],
})
export class DiscoverComponent implements OnInit {
  savedTracks: unknown[] = [];
  userId: 'string' = null;

  constructor(private api: SpotifyApiService) {}

  ngOnInit(): void {
    this.getUserProfile().then((res) => console.log(res));
    // this.getRecommendations());
    // console.log(this.savedTracks);
  }

  async getRecommendations() {
    const result = await this.api.main(this.userId);
    this.savedTracks = result;
  }

  async getUserProfile() {
    const result = await this.api.getUserProfile();
    console.log(result);
    this.userId = result.id;
  }
}
