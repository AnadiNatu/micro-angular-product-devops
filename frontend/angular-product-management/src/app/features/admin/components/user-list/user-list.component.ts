import { Component, NgModule, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { User } from "../../../../core/models/user.model";
import { AdminService } from "../../services/admin.service";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HighlightDirective } from "../../../../shared/directives/highlight.directive";

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective],
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  /**
   * Load all users
   */
  loadUsers(): void {
    this.isLoading = true;
    
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.isLoading = false;
        console.log('Users loaded:', users.length);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Search users
   */
  searchUsers(): void {
    const term = this.searchTerm.toLowerCase().trim();
    
    if (!term) {
      this.filteredUsers = this.users;
      return;
    }

    this.filteredUsers = this.users.filter(user => {
      const fullName = `${user.fname} ${user.lname}`.toLowerCase();
      const email = user.email.toLowerCase();
      
      return fullName.includes(term) || email.includes(term);
    });

    console.log('Filtered users:', this.filteredUsers.length);
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredUsers = this.users;
  }

  /**
   * Get role badge class
   */
  getRoleBadgeClass(role: string): string {
    return role === 'ADMIN' ? 'bg-danger' : 'bg-success';
  }

  /**
   * Navigate back to dashboard
   */
  goBack(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}