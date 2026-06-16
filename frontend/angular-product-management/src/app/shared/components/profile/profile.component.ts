import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HighlightDirective } from '../../directives/highlight.directive';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, HighlightDirective]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isEditMode = false;
  uploadedImage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeForm();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      fname: [{ value: this.currentUser?.fname || '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      lname: [{ value: this.currentUser?.lname || '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      email: [{ value: this.currentUser?.email || '', disabled: true }, [Validators.required, Validators.email]],
      phoneNumber: [{ value: this.currentUser?.phoneNumber || '', disabled: true }, [Validators.pattern(/^[+]?[\d\s\-()]+$/)]]
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.profileForm.get('fname')?.enable();
      this.profileForm.get('lname')?.enable();
      this.profileForm.get('phoneNumber')?.enable();
    } else {
      this.profileForm.get('fname')?.disable();
      this.profileForm.get('lname')?.disable();
      this.profileForm.get('phoneNumber')?.disable();
      this.profileForm.patchValue({
        fname: this.currentUser?.fname,
        lname: this.currentUser?.lname,
        phoneNumber: this.currentUser?.phoneNumber
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(k => this.profileForm.get(k)?.markAsTouched());
      return;
    }
    const v = this.profileForm.getRawValue();
    if (this.currentUser) {
      const updated: User = { ...this.currentUser, fname: v.fname, lname: v.lname, phoneNumber: v.phoneNumber, avatar: this.uploadedImage || this.currentUser.avatar };
      this.authService.updateUser(updated);
      this.currentUser = updated;
      alert('Profile updated successfully!');
    }
    this.toggleEditMode();
  }

  logout(): void {
    this.authService.logout();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => { this.uploadedImage = e.target.result; };
      reader.readAsDataURL(file);
    }
  }

  hasError(f: string): boolean {
    const c = this.profileForm.get(f);
    return !!(c && c.invalid && c.touched);
  }

  getErrorMessage(f: string): string {
    const c = this.profileForm.get(f);
    if (c?.hasError('required')) return `${f} is required`;
    if (c?.hasError('minlength')) return `${f} must be at least 2 characters`;
    if (c?.hasError('email')) return 'Invalid email format';
    if (c?.hasError('pattern')) return 'Invalid phone number format';
    return '';
  }

  getAvatar(): string {
    return this.uploadedImage || this.currentUser?.avatar ||
      `https://ui-avatars.com/api/?name=${this.currentUser?.fname}+${this.currentUser?.lname}&background=random`;
  }
}