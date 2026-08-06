import type { AuthUser } from "@/lib/types/auth";

interface StoredUser extends AuthUser {
  password: string;
}

const adminUser: StoredUser = {
  id: "1",
  username: "admin",
  name: "System Administrator",
  role: "admin",
  password: "admin123",
};

function toAuthUser(user: StoredUser): AuthUser {
  const { password: _password, ...authUser } = user;
  return authUser;
}

export function findUserByCredentials(
  username: string,
  password: string,
): AuthUser | null {
  if (
    adminUser.username.toLowerCase() === username.trim().toLowerCase() &&
    adminUser.password === password
  ) {
    return toAuthUser(adminUser);
  }

  return null;
}

export function usernameExists(username: string): boolean {
  const normalized = username.trim().toLowerCase();
  return adminUser.username.toLowerCase() === normalized;
}

export function createUser(_input: {
  name: string;
  username: string;
  password: string;
}): AuthUser {
  throw new Error("Student accounts must be created from the admin Accounts page.");
}
