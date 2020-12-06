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

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    console.log(route.fragment);
    if (route.routeConfig.path === 'callback') {
      if (route.fragment.includes('access_token=')) {
        if (
          route.fragment.substr(route.fragment.indexOf('state=') + 6, 16) ===
          localStorage.getItem('spotify_auth_state')
        ) {
          localStorage.setItem(
            'access_token',
            route.fragment.substring(13, route.fragment.indexOf('&'))
          );
          return this.router.createUrlTree(['/discover-daily']);
        }
      }
    }
    return true;
  }
}
