import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TrackObjectSimplified } from '../../models/spotify-api';
import { DiscoverService } from '../discover/discover.service';

@Injectable()
export class RecommendService {
  recommendedSongs$: BehaviorSubject<TrackObjectSimplified[]> = this.d.recommendedSongs$;

  constructor(private d: DiscoverService) {}
}
