export interface User {
  id: number;
  email: string;
  name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  date_joined?: string;
  scans_count?: number;
  reports_count?: number;
}

export interface AuthUser {
  email: string;
  name: string;
  token: string;
  refresh: string;
}

export interface ProfileResponse {
  success: boolean;
  data: User;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
}
