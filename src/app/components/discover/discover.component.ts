import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../../services/spotify-api/spotify-api.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css'],
})
export class DiscoverComponent implements OnInit {
  savedTracks: unknown[] = [];
  userId: 'string' = null;

  constructor(private api: SpotifyApiService) {}

  ngOnInit(): void {
    this.getUserProfile();
    this.getRecommendations();
    console.log(this.savedTracks);
  }

  async getRecommendations() {
    const result = await this.api.main(this.userId);
    this.savedTracks = await result.json();
  }

  async getUserProfile() {
    const result = await this.api.getUserProfile();
    const userProfile = await result.json;
    console.log(userProfile);
    this.userId = userProfile.id;
  }
}
