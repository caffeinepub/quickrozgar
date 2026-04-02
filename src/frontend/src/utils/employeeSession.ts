const SESSION_KEY = "qr_employee_session";

export interface EmployeeSession {
  role: "employee";
  phone: string;
  email: string;
  name?: string;
  createdAt: number;
}

export function saveEmployeeSession(
  phone: string,
  email: string,
  name?: string,
): void {
  const session: EmployeeSession = {
    role: "employee",
    phone,
    email,
    name,
    createdAt: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getEmployeeSession(): EmployeeSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EmployeeSession;
    if (parsed.role !== "employee") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearEmployeeSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getEmployeeSessionKey(session: EmployeeSession): string {
  return `emp_${session.phone}_${session.email}`;
}
