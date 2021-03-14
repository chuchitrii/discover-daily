import { Component, OnInit, Input } from '@angular/core';
import { TrackObjectSimplified } from 'src/app/models/spotify-api';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
})
export class PlaylistComponent implements OnInit {
  @Input() tracks: TrackObjectSimplified[] = [];

  constructor() {}

  ngOnInit() {}
}
