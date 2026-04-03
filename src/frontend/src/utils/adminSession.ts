const ADMIN_SESSION_KEY = "qr_admin_logged_in";

export function saveAdminSession(): void {
  localStorage.setItem(ADMIN_SESSION_KEY, "true");
}

export function isAdminLoggedIn(): boolean {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function clearAdminSession(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}
