import { Component, OnDestroy, OnInit, Signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightDirective } from '../../directives/highlight.directive';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { User } from '../../../core/models/user.model';
import { Subscription } from 'rxjs/internal/Subscription';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule ,  NzAvatarModule,
    NzButtonModule,
    NzDropDownModule,
    NzIconModule,
    NzMenuModule]
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  private userSub!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  logout(): void {
    this.authService.logout();
  }

  getFullName(): string {
    return this.currentUser
      ? `${this.currentUser.fname} ${this.currentUser.lname}`
      : 'Guest';
  }

  getInitials(): string {
    if (!this.currentUser){
      return 'G'; 
    }
    const firstInitial = this.currentUser.fname?.charAt(0) ?? '';
    const lastInitial = this.currentUser.lname?.charAt(0) ?? '';


    return `${firstInitial}${lastInitial}`.toUpperCase() || 'G';
  }

  getProfileRoute(): string {
    return this.currentUser?.role === 'ADMIN' ? '/admin/profile' : '/user/profile';
  }
}