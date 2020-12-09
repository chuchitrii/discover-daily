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
export class CallbackAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    console.log(route);
    const queryParams = route.fragment;
    if (queryParams.includes('access_token=')) {
      console.log(1);
      if (
        route.fragment.substr(route.fragment.indexOf('state=') + 6, 16) ===
        localStorage.getItem('state')
      ) {
        console.log(2);
        localStorage.setItem(
          'access_token',
          route.fragment.substring(13, route.fragment.indexOf('&'))
        );
        this.auth.isLoggedIn$.next(true);
        return this.router.createUrlTree(['/discover-daily']);
      }
    }
    // }
    // else if (route.fragment && route.fragment.includes('error=')) {
    //   console.log(
    //     route.fragment.substring(
    //       route.fragment.indexOf('error=') + 6,
    //       route.fragment.indexOf('&')
    //     )
    //   );
    //   return this.router.createUrlTree(['/login']);
    // }
    // else {
    //   if (this.auth.isLoggedIn$.value) {
    //     return this.router.createUrlTree(['/discover-daily']);
    //   } else {
    //     return this.router.createUrlTree(['/login']);
    //   }
    // }
  }
}
