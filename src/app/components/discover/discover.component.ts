import { Component, OnInit } from '@angular/core';
import { SpotifyApiService } from '../../services/spotify-api/spotify-api.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css'],
})
export class DiscoverComponent implements OnInit {
  constructor(private api: SpotifyApiService) {}

  ngOnInit(): void {}
}
