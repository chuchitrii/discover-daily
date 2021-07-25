import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { RecommendService } from '../../services/recommend/recommend.service';

@Component({
  selector: 'app-recommend',
  templateUrl: './recommend.component.html',
  styleUrls: ['./recommend.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RecommendService],
})
export class RecommendComponent implements OnInit {
  constructor(public r: RecommendService) {}

  ngOnInit(): void {}
}
