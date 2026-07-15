import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginCredentials, UserRole } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  returnUrl = '';
  showPassword = false;

  demoCredentials = {
    admin: {
      username : 'admin',
      email: 'blackplaindot+admin@gmail.com',
      password: 'black_admin@1',
      label: 'Admin Account',
      icon: 'bi-shield-lock-fill',
      color: 'danger'
    },
    user: {
      username : 'user',
      email: 'blackplaindot+user@gmail.com',
      password: 'black_user@1',
      label: 'User Account',
      icon: 'bi-person-fill',
      color: 'success'
    }
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key =>
        this.loginForm.get(key)?.markAsTouched()
      );
      return;
    }

    const credentials: LoginCredentials = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.performLogin(credentials);
  }

  private performLogin(credentials: LoginCredentials): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.loginForm.disable();

    this.authService.login(credentials).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.loginForm.enable();
        this.showSuccessMessage(user.fname);
        setTimeout(() => this.redirectAfterLogin(user.role), 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.loginForm.enable();
        this.errorMessage = error.message || 'Invalid credentials. Please try again.';
        this.shakeForm();
      }
    });
  }

  private redirectAfterLogin(role: string): void {
    if (this.returnUrl && !this.returnUrl.includes('/auth/')) {
      this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
      return;
    }
    if (role === UserRole.ADMIN) {
      this.router.navigate(['/admin/dashboard'], { replaceUrl: true });
    } else {
      // USER role always goes to user products page
      this.router.navigate(['/user/products'], { replaceUrl: true });
    }
  }

  quickLogin(type: 'admin' | 'user'): void {
    const creds = this.demoCredentials[type];
    this.loginForm.patchValue({ username: creds.username, password: creds.password });
    setTimeout(() => this.onSubmit(), 300);
  }

  private showSuccessMessage(userName: string): void {
    const div = document.createElement('div');
    div.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
    div.style.zIndex = '9999';
    div.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>Welcome back, ${userName}!`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2000);
  }

  private shakeForm(): void {
    const el = document.querySelector('.login-card');
    el?.classList.add('shake');
    setTimeout(() => el?.classList.remove('shake'), 500);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError('required')) return `${fieldName === 'email' ? 'Email/Username' : 'Password'} is required`;
    if (field?.hasError('minlength')) return 'Password must be at least 6 characters';
    return '';
  }

  goToSignup(): void { this.router.navigate(['/auth/signup']); }
  goToForgotPassword(): void { this.router.navigate(['/auth/forgot-password']); }
  goToHome(): void { this.router.navigate(['/auth/home']); }
}