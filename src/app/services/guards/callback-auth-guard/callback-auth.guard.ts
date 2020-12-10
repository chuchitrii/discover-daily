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
    const fragment = route.fragment;
    const queryParams = new HttpParams({ fromString: fragment });
    console.log(queryParams);
    if (queryParams.has('error')) {
    }
    // if (queryParams.includes('access_token=')) {
    //   if (
    //     route.fragment.substr(route.fragment.indexOf('state=') + 6, 16) ===
    //     localStorage.getItem('state')
    //   ) {
    //     localStorage.setItem(
    //       'access_token',
    //       route.fragment.substring(13, route.fragment.indexOf('&'))
    //     );
    //     this.auth.isLoggedIn$.next(true);
    //     return this.router.createUrlTree(['/discover-daily']);
    //   }
    // }
    return false;
  }
}
