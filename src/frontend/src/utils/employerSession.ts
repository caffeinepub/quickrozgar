const SESSION_KEY = "qr_employer_session";

export interface EmployerSession {
  role: "employer";
  phone: string;
  email: string;
  companyName?: string;
  createdAt: number;
}

export function saveEmployerSession(
  phone: string,
  email: string,
  companyName?: string,
): void {
  const session: EmployerSession = {
    role: "employer",
    phone,
    email,
    companyName,
    createdAt: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getEmployerSession(): EmployerSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EmployerSession;
    if (parsed.role !== "employer") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearEmployerSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getEmployerSessionKey(session: EmployerSession): string {
  return `erp_${session.phone}_${session.email}`;
}
