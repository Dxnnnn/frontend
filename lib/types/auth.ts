export type UserRole = "admin" | "user" | "faculty";

export type LoginPortal = "student" | "staff";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  department?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
  expectedPortal?: LoginPortal;
}

export interface SignupRequest {
  name: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
}

export function getRoleDestination(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "faculty":
      return "/faculty";
    case "user":
      return "/user";
  }
}

export function isRoleAllowedInPortal(
  role: UserRole,
  portal: LoginPortal,
): boolean {
  if (portal === "student") {
    return role === "user";
  }

  return role === "admin" || role === "faculty";
}
