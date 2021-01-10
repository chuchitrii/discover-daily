import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  user: any;
  destroySub: Subject<boolean>;
  isLoggedIn: boolean;

  constructor(private as: AuthService) {
    this.destroySub = new Subject();
  }

  ngOnInit(): void {
    this.as.isLoggedIn$.pipe(takeUntil(this.destroySub)).subscribe((res) => {
      this.isLoggedIn = res;
    });
  }

  logout() {
    this.as.logout();
  }
}
