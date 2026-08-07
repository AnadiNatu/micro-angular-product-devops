export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export enum UserRoleShort {
  ADMIN = 'ADMIN',
  USER  = 'USER'
}

export interface User {
  id:           number;
  username:     string;
  email:        string;
  roles:        string[];       // e.g. ['ROLE_ADMIN'] — raw from JWT claim
  role:         UserRole;       // primary role mapped for guard / display use
  phoneNumber?: string;
  profilePicture?: string;
  provider?:    string;         // 'LOCAL' | 'GOOGLE' | 'GITHUB'
 
  // Legacy aliases kept so old components that read fname/lname don't break
  fname?: string;
  lname?: string;
  avatar?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthenticatonResponse {
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

export interface MessageRespose {
  message : string;
}

export interface ProfilePictureSyncDto{
  userId : number;
  profilePictureUrl : string;
}

export interface RefreshToken{
  refreshToken : string;
}

export interface RegisterRequest{
  username : string;
  password : string;
  email : string;
  phoneNumber : string;
  roles : string[];
}

export interface ValidateTokenRequest{
  token : string;
}

export interface ValidateTokenResponse{
  valid : boolean;
  username : string;
  roles : string[];
  message : string;
}