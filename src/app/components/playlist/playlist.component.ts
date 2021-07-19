import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { TrackObjectSimplified } from 'src/app/models/spotify-api';
import { DiscoverService } from '../../services/discover/discover.service';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistComponent implements OnInit {
  @Input() tracks: TrackObjectSimplified[] = [];

  constructor(public ds: DiscoverService) {}

  ngOnInit() {}
}
