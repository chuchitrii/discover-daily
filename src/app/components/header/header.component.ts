import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserObjectPublic } from '../../models/spotify-api';
import { DiscoverService } from '../../services/discover/discover.service';
import { DeviceService } from '../../services/device/device.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  user: UserObjectPublic;
  destroySub: Subject<boolean>;
  isLoggedIn: boolean;

  constructor(private as: AuthService, public ds: DiscoverService, public device: DeviceService) {
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
