const USERNAME_KEY = "eval_remembered_username";
const REMEMBER_KEY = "eval_remember_me";

export function saveRememberMe(username: string) {
  window.localStorage.setItem(USERNAME_KEY, username);
  window.localStorage.setItem(REMEMBER_KEY, "true");
}

export function clearRememberMe() {
  window.localStorage.removeItem(USERNAME_KEY);
  window.localStorage.removeItem(REMEMBER_KEY);
}

export function getRememberMe(): {
  username: string;
  rememberMe: boolean;
} | null {
  const rememberMe = window.localStorage.getItem(REMEMBER_KEY) === "true";
  const username = window.localStorage.getItem(USERNAME_KEY);

  if (!rememberMe || !username) {
    return null;
  }

  return { username, rememberMe: true };
}
