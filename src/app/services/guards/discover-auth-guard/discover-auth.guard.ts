import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { DiscoverService } from '../../discover/discover.service';
import { UserService } from '../../user/user.service';
import { map, mapTo, switchMap, switchMapTo, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DiscoverAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router, private user: UserService, private d: DiscoverService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | UrlTree {
    if (this.auth.isLoggedIn()) {
      return this.user.init().pipe(mapTo(true));
    } else {
      return this.router.createUrlTree(['login']);
    }
  }
}
