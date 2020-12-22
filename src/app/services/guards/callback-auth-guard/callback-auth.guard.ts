import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CallbackAuthGuard implements CanActivate {
  accessQuery = 'access_token=';
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const queryParams = new HttpParams({ fromString: route.fragment });
    const qState = queryParams.get('state');
    const lState = localStorage.getItem('state');

    if (this.auth.isLoggedIn()) {
      console.log('g', 1);
      return this.router.createUrlTree(['/discover-daily']);
    }

    if (queryParams.has('access_token') && lState === qState) {
      console.log('g', 2);
      localStorage.setItem('access_token', queryParams.get('access_token'));
      localStorage.setItem('expires_in', queryParams.get('expires_in'));
      localStorage.setItem('accessed_at', Date.now().toString(10));

      return this.router.createUrlTree(['/discover-daily']);
    }

    if (queryParams.has('error')) {
      console.log('g', 3);

      console.error(queryParams.get('error'));
      return this.router.createUrlTree(['/login']);
    }

    console.log('g', 4);
    return this.router.createUrlTree(['/login']);
  }
}
