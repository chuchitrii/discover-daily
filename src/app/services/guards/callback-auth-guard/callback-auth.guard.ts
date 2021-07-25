import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CallbackAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const queryParams = new HttpParams({ fromString: route.fragment });
    const qState = queryParams.get('state');
    const lState = localStorage.getItem('state');

    if (this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['']);
    }

    if (queryParams.has('access_token') && lState === qState) {
      localStorage.setItem('access_token', queryParams.get('access_token'));
      localStorage.setItem('expires_in', queryParams.get('expires_in'));
      localStorage.setItem('accessed_at', Date.now().toString(10));
      return this.router.createUrlTree(['']);
    }

    if (queryParams.has('error')) {
      console.error(queryParams.get('error'));
      return this.router.createUrlTree(['/login']);
    }

    return this.router.createUrlTree(['/login']);
  }
}
