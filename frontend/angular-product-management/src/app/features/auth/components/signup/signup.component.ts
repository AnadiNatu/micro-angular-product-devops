import { Component, OnInit } from '@angular/core';
import {
  FormBuilder, FormGroup, Validators, AbstractControl,
  ValidationErrors, FormsModule, ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SignUpDTO } from '../../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { HighlightDirective } from '../../../../shared/directives/highlight.directive';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, HighlightDirective]
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.signupForm = this.fb.group({
      fname: ['', [Validators.required, Validators.minLength(2)]],
      lname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s\-()]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.signupForm.get('password')?.valueChanges.subscribe(p => this.calculatePasswordStrength(p));
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const p = control.get('password');
    const c = control.get('confirmPassword');
    if (!p || !c) return null;
    return p.value === c.value ? null : { passwordMismatch: true };
  }

  private calculatePasswordStrength(password: string): void {
    if (!password) { this.passwordStrength = 0; return; }
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[a-z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) s++;
    this.passwordStrength = s;
  }

  getPasswordStrengthLabel(): string {
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return labels[this.passwordStrength] || '';
  }

  getPasswordStrengthColor(): string {
    const colors = ['secondary', 'danger', 'warning', 'info', 'success', 'success'];
    return colors[this.passwordStrength] || 'secondary';
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      Object.keys(this.signupForm.controls).forEach(k => this.signupForm.get(k)?.markAsTouched());
      return;
    }

    const data: SignUpDTO = {
      fname: this.signupForm.value.fname,
      lname: this.signupForm.value.lname,
      email: this.signupForm.value.email,
      phoneNumber: this.signupForm.value.phoneNumber,
      password: this.signupForm.value.password
    };

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.signup(data).subscribe({
      next: () => {
        this.isLoading = false;
        alert('Account created successfully! Please login.');
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Registration failed. Please try again.';
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') this.showPassword = !this.showPassword;
    else this.showConfirmPassword = !this.showConfirmPassword;
  }

  hasError(f: string): boolean {
    const c = this.signupForm.get(f);
    return !!(c && c.invalid && c.touched);
  }

  getErrorMessage(f: string): string {
    const c = this.signupForm.get(f);
    if (c?.hasError('required')) return `${this.getFieldLabel(f)} is required`;
    if (c?.hasError('minlength')) return `${this.getFieldLabel(f)} must be at least ${c.errors?.['minlength'].requiredLength} characters`;
    if (c?.hasError('email')) return 'Please enter a valid email address';
    if (c?.hasError('pattern')) return 'Please enter a valid phone number';
    return '';
  }

  getFormError(): string {
    return this.signupForm.hasError('passwordMismatch') ? 'Passwords do not match' : '';
  }

  private getFieldLabel(f: string): string {
    const labels: { [k: string]: string } = {
      fname: 'First name', lname: 'Last name', email: 'Email',
      phoneNumber: 'Phone number', password: 'Password', confirmPassword: 'Confirm password'
    };
    return labels[f] || f;
  }

  goToLogin(): void { this.router.navigate(['/auth/login']); }
  goToHome(): void { this.router.navigate(['/auth/home']); }
}