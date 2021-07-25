import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TrackObjectSimplified } from '../../models/spotify-api';
import { DiscoverService } from '../discover/discover.service';
import { share, startWith, switchMap, switchMapTo } from 'rxjs/operators';

@Injectable()
export class RecommendService {
  public get recommendedSongs$(): Observable<TrackObjectSimplified[]> {
    return this.d.recommendedSongs$;
  }

  public get getRecommendationsSubject() {
    return this.d.getRecommendationsSubject;
  }

  public get addTracksToPlaylistSubject() {
    return this.d.addTracksToPlaylistSubject;
  }

  songsAddition$ = this.addTracksToPlaylistSubject.pipe(this.d.wrap(this.d.addTracksToPlaylist));
  addTracksProcessing$ = this.d.loading([this.addTracksToPlaylistSubject], [this.songsAddition$]).pipe(share());
  recommendationsLoading$ = this.d.loading([this.getRecommendationsSubject], [this.recommendedSongs$]).pipe(startWith(false), share());

  constructor(private d: DiscoverService) {
    this.addTracksProcessing$.subscribe((r) => console.log('addtracksprocessing', r));
    this.recommendationsLoading$.subscribe((r) => console.log('recommendationsloading', r));
    this.recommendedSongs$.subscribe((r) => console.log('recommendedsongs', r));
  }
}
