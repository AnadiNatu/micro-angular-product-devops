import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightDirective } from '../../directives/highlight.directive';
import { HeaderComponent } from '../header/header.component';
import { Subject } from 'rxjs';
interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule, HighlightDirective]
})
export class SidebarComponent implements OnInit , OnDestroy {

  activeRoute = '';
  menuItems: MenuItem[] = [];

  private destroy$ = new Subject<void>();

  private allMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'bi-speedometer2', route: '/admin/dashboard', roles: [UserRole.ADMIN] },
    { label: 'Products', icon: 'bi-box-seam', route: '/admin/products', roles: [UserRole.ADMIN] },
    { label: 'Orders', icon: 'bi-cart-check', route: '/admin/orders', roles: [UserRole.ADMIN] },
    { label: 'Users', icon: 'bi-people', route: '/admin/users', roles: [UserRole.ADMIN] },

    {
      label: 'Order Logs',
      icon: 'bi-journal-text',
      route: '/admin/logs',
      roles: [UserRole.ADMIN],
      children: [
        {
          label: 'By Product',
          icon: 'bi-box',
          route: '/admin/logs/product',
          roles: [UserRole.ADMIN]
        },
        {
          label: 'By User',
          icon: 'bi-person',
          route: '/admin/logs/users',
          roles: [UserRole.ADMIN]
        }
      ]
    },

    { label: 'Health Monitor', icon: 'bi-heart-pulse', route: '/admin/health', roles: [UserRole.ADMIN] },
    { label: 'My Profile', icon: 'bi-person-circle', route: '/admin/profile', roles: [UserRole.ADMIN] },

    { label: 'Browse Products', icon: 'bi-grid', route: '/user/products', roles: [UserRole.USER] },
    { label: 'My Orders', icon: 'bi-bag-check', route: '/user/orders', roles: [UserRole.USER] },
    { label: 'My Profile', icon: 'bi-person-circle', route: '/user/profile', roles: [UserRole.USER] }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.activeRoute = this.router.url;

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.activeRoute = event.urlAfterRedirects;
      });

    this.loadMenuItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMenuItems(): void {
    const userRole = this.authService.getUserRole();

    if (!userRole) {
      this.menuItems = [];
      return;
    }

    this.menuItems = this.allMenuItems.filter(
      item => item.roles.includes(userRole)
    );
  }

  logout(): void {
    this.authService.logout();
  }

  isActive(route: string): boolean {
    return this.activeRoute.startsWith(route);
  }
}