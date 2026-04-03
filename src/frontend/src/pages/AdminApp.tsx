import { useEffect, useState } from "react";
import {
  clearAdminSession,
  isAdminLoggedIn,
  saveAdminSession,
} from "../utils/adminSession";
import AdminLoginScreen from "./AdminLoginScreen";
import AdminPanel from "./AdminPanel";

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(() => isAdminLoggedIn());

  useEffect(() => {
    document.title = "Quick Rozgar Admin";
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    setLoggedIn(false);
  };

  return loggedIn ? (
    <AdminPanel onLogout={handleLogout} />
  ) : (
    <AdminLoginScreen
      onLogin={() => {
        saveAdminSession();
        setLoggedIn(true);
      }}
    />
  );
}
