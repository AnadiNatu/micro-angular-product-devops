import { Injectable } from "@angular/core";
import { User } from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class StorageService {
   private readonly USER_KEY = 'auth-user';
  private readonly TOKEN_KEY = 'auth-token';

  constructor() {}

  saveUser(user: User): void {
    window.localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const userJson = window.localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    try {
      const parsed = JSON.parse(userJson);
      if (
        typeof parsed.id === 'number' &&
        typeof parsed.fname === 'string' &&
        typeof parsed.lname === 'string' &&
        typeof parsed.email === 'string' &&
        (parsed.role === 'ADMIN' || parsed.role === 'USER')
      ) {
        return parsed as User;
      }
      console.warn('StorageService: stale/invalid user shape, clearing.');
      this.clear();
      return null;
    } catch (error) {
      this.clear();
      return null;
    }
  }

  saveToken(token: string): void {
    window.localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return window.localStorage.getItem(this.TOKEN_KEY);
  }

  clear(): void {
    window.localStorage.removeItem(this.USER_KEY);
    window.localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null && this.getUser() !== null;
  }
}