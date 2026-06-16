import { Component, OnDestroy, OnInit, Signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightDirective } from '../../directives/highlight.directive';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { User } from '../../../core/models/user.model';
import { Subscription } from 'rxjs/internal/Subscription';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule]
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
    if (!this.currentUser) return 'G';
    return `${this.currentUser.fname.charAt(0)}${this.currentUser.lname.charAt(0)}`.toUpperCase();
  }
}