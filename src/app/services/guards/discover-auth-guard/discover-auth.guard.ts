import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../user/user.service';
import { mapTo } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { fetchUser } from '../../../state/discover.actions';

@Injectable({
  providedIn: 'root',
})
export class DiscoverAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router, private user: UserService, private store: Store) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | UrlTree {
    this.store.dispatch(fetchUser({}));
    if (this.auth.isLoggedIn()) {
      return this.user.init().pipe(mapTo(true));
    } else {
      return this.router.createUrlTree(['login']);
    }
  }
}
