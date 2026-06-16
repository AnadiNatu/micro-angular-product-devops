import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {

    const isLoggedIn = this.authService.isLoggedIn();
    const userRole = this.authService.getUserRole();

    // Auth routes (/auth/login, /auth/signup etc.)
    // Redirect already-logged-in users to their dashboard
    if (route.data['isAuthRoute']) {
      if (isLoggedIn && userRole === UserRole.ADMIN) {
        return this.router.createUrlTree(['/admin/dashboard']);
      }
      if (isLoggedIn && userRole === UserRole.USER) {
        return this.router.createUrlTree(['/user/products']);
      }
      return true;
    }

    // Protected routes
    if (!isLoggedIn) {
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    const expectedRole = route.data['role'];
    if (expectedRole && userRole !== expectedRole) {
      if (userRole === UserRole.ADMIN) {
        return this.router.createUrlTree(['/admin/dashboard']);
      }
      if (userRole === UserRole.USER) {
        return this.router.createUrlTree(['/user/products']);
      }
      return this.router.createUrlTree(['/auth/login']);
    }

    return true;
  }
}