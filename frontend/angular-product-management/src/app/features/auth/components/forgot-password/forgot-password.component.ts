import { Component, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ForgotPasswordRequest } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { HighlightDirective } from '../../../../shared/directives/highlight.directive';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [RouterLink, CommonModule , FormsModule, ReactiveFormsModule , HighlightDirective],
  standalone: true
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.get('email')?.markAsTouched();
      return;
    }

    const request: ForgotPasswordRequest = {
      email: this.forgotPasswordForm.value.email
    };

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(request).subscribe({
      next: (message) => {
        this.isLoading = false;
        this.successMessage = message;
        console.log('Password reset email sent');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to send reset email. Please try again.';
        console.error('Forgot password error:', error);
      }
    });
  }

  /**
   * Check if email field has error
   */
  hasEmailError(): boolean {
    const email = this.forgotPasswordForm.get('email');
    return !!(email && email.invalid && email.touched);
  }

  /**
   * Get email error message
   */
  getEmailError(): string {
    const email = this.forgotPasswordForm.get('email');
    
    if (email?.hasError('required')) {
      return 'Email is required';
    }
    if (email?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    
    return '';
  }

  /**
   * Navigate to login
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
