import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { HighlightDirective } from '../../../../shared/directives/highlight.directive';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective , RouterModule],
  standalone: true

})
export class HomePageComponent {
  
   features = [
    {
      icon: 'bi-box-seam',
      title: 'Product Management',
      description: 'Efficiently manage your product inventory with real-time tracking'
    },
    {
      icon: 'bi-cart-check',
      title: 'Order Processing',
      description: 'Streamlined order management from creation to delivery'
    },
    {
      icon: 'bi-people',
      title: 'User Management',
      description: 'Comprehensive user administration and role-based access'
    },
    {
      icon: 'bi-graph-up',
      title: 'Analytics & Reports',
      description: 'Detailed insights and analytics for better decision making'
    }
  ];

  constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }
}
