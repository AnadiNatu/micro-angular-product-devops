import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { delay, tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { User, LoginCredentials, SignUpDTO, UserRole, ForgotPasswordRequest, ResetPasswordRequest } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 private readonly AUTH_URL = 'http://localhost:8083/api/auth';
  private readonly PASSWORD_URL = 'http://localhost:8083/api/password';

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  public userSignal = signal<User | null>(null);
  public isAuthenticated = computed(() => this.userSignal() !== null);
  public userName = computed(() => this.userSignal()?.fname || 'Guest');
  public userRole = computed(() => this.userSignal()?.role || null);

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  private initializeAuthState(): void {
    const savedUser = this.storageService.getUser();
    if (savedUser) {
      this.currentUserSubject.next(savedUser);
      this.userSignal.set(savedUser);
    } else {
      this.currentUserSubject.next(null);
      this.userSignal.set(null);
    }
  }

  login(credentials: LoginCredentials): Observable<User> {
    // The backend LoginRequest uses 'username' field (which accepts email/phone/username)
    const backendPayload = {
      username: credentials.email,
      password: credentials.password
    };

    return this.http.post<any>(`${this.AUTH_URL}/login`, backendPayload).pipe(
      map(response => this.mapBackendResponseToUser(response, credentials.email)),
      tap(user => this.setSession(user, '')),
      catchError(error => {
        const message = error.error?.message || error.message || 'Invalid credentials';
        return throwError(() => new Error(message));
      })
    );
  }

  // Overload that also saves the raw token
  loginWithToken(credentials: LoginCredentials): Observable<{ user: User; token: string }> {
    const backendPayload = {
      username: credentials.email,
      password: credentials.password
    };

    return this.http.post<any>(`${this.AUTH_URL}/login`, backendPayload).pipe(
      map(response => ({
        user: this.mapBackendResponseToUser(response, credentials.email),
        token: response.token || response.jwt || ''
      })),
      tap(({ user, token }) => this.setSession(user, token)),
      catchError(error => {
        const message = error.error?.message || 'Invalid credentials';
        return throwError(() => new Error(message));
      })
    );
  }

  private mapBackendResponseToUser(response: any, email: string): User {
    // Backend AuthResponse: { id, token, refreshToken, username, email, roles, expiresIn }
    // roles is a Set<String> like ["ROLE_ADMIN"] or ["ROLE_USER"]
    const roles: string[] = response.roles
      ? Array.from(response.roles as string[])
      : [];

    let role = UserRole.USER;
    if (roles.some(r => r.includes('ADMIN'))) {
      role = UserRole.ADMIN;
    }

    const username: string = response.username || email;
    // Build fname/lname from username since backend doesn't have separate first/last
    const nameParts = username.split(' ');
    const fname = nameParts[0] || username;
    const lname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    return {
      id: response.id || 0,
      fname,
      lname,
      email: response.email || email,
      role,
      username,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=4f46e5&color=fff`
    };
  }

  private setSession(user: User, token: string): void {
    this.storageService.saveUser(user);
    if (token) {
      this.storageService.saveToken(token);
    }
    this.currentUserSubject.next(user);
    this.userSignal.set(user);
  }

  signup(data: SignUpDTO): Observable<User> {
    // Backend RegisterRequest: { username, password, email, phoneNumber, roles }
    const backendPayload = {
      username: `${data.fname} ${data.lname}`.trim(),
      password: data.password,
      email: data.email,
      phoneNumber: data.phoneNumber,
      roles: ['ROLE_USER']
    };

    return this.http.post<any>(`${this.AUTH_URL}/register`, backendPayload).pipe(
      map(response => this.mapBackendResponseToUser(response, data.email)),
      catchError(error => {
        const message = error.error?.message || 'Registration failed';
        return throwError(() => new Error(message));
      })
    );
  }

  logout(): void {
    this.storageService.clear();
    this.currentUserSubject.next(null);
    this.userSignal.set(null);
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  updateUser(user: User): void {
    this.storageService.saveUser(user);
    this.currentUserSubject.next(user);
    this.userSignal.set(user);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getUserRole(): UserRole | null {
    return this.currentUserSubject.value?.role || null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    return this.http.post<any>(
      `${this.PASSWORD_URL}/forgot?email=${encodeURIComponent(request.email)}`,
      {}
    ).pipe(
      map(res => res.message || 'OTP sent to your email'),
      catchError(error => {
        const message = error.error?.message || 'Failed to send reset link';
        return throwError(() => new Error(message));
      })
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.http.post<any>(
      `${this.PASSWORD_URL}/reset?identifier=${encodeURIComponent(request.email)}&otp=${encodeURIComponent(request.token)}&newPassword=${encodeURIComponent(request.newPassword)}`,
      {}
    ).pipe(
      map(() => void 0),
      catchError(error => {
        const message = error.error?.message || 'Password reset failed';
        return throwError(() => new Error(message));
      })
    );
  }

  isAdmin(): boolean {
    return this.getUserRole() === UserRole.ADMIN;
  }

  isUser(): boolean {
    return this.getUserRole() === UserRole.USER;
  }
}