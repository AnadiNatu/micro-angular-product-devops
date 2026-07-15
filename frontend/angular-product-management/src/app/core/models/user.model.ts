export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: number;
  fname: string;
  lname: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  avatar?: string;
  username?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthenticatoonResponse {
  userId: number;
  jwt: string;
  fullName: string;
  userRole: UserRole;
}

export interface SignUpDTO {
  fname: string;
  lname: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}