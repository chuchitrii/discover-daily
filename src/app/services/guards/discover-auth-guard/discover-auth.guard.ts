import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { DiscoverService } from '../../discover/discover.service';

@Injectable({
  providedIn: 'root',
})
export class DiscoverAuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router, private ds: DiscoverService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    if (this.auth.isLoggedIn()) {
      await this.ds.getUserProfile();
      return true;
    } else {
      return this.router.createUrlTree(['/login']);
    }
  }
}
