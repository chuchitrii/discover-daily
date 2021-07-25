import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean;
  destroySub: Subject<boolean> = new Subject<boolean>();

  constructor(private as: AuthService) {}

  ngOnInit(): void {
    this.as.isLoggedIn$.pipe(takeUntil(this.destroySub)).subscribe((res) => {
      this.isLoggedIn = res;
    });
  }

  ngOnDestroy(): void {
    this.destroySub.next(true);
  }
}
