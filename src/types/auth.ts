export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  role?: "admin" | "teacher" | "student";
  admin_secret_code?: string;
  first_name?: string;
  last_name?: string;
  password_auth_enabled?: boolean;
}

export interface AuthResponse {
  message?: string;
  user?: User;
  error?: string;
  authenticated?: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: "admin" | "teacher" | "student";
  admin_secret_code?: string;
}

export interface NewUserInput {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: "admin" | "teacher" | "student";
  is_staff?: boolean;
  password_auth_enabled: boolean;
  password?: string;
}
