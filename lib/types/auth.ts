export type UserRole = "admin" | "user" | "faculty";
export type AdminSubRole = "Executive Office" | "Data Center" | "Super Admin";

export type LoginPortal = "student" | "staff";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  adminRole?: AdminSubRole;
  department?: string;
  permissions?: Record<string, boolean>;
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

export function getRoleDestination(role: UserRole, adminRole?: AdminSubRole): string {
  switch (role) {
    case "admin":
      if (adminRole === "Executive Office") return "/eo";
      if (adminRole === "Data Center") return "/dc";
      return "/admin/settings"; // Super Admin
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
