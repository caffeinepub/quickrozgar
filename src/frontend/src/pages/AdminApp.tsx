import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import AdminLoginScreen from "./AdminLoginScreen";
import AdminPanel from "./AdminPanel";

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem("adminLoggedIn") === "true",
  );
  const { clear } = useInternetIdentity();

  useEffect(() => {
    document.title = "Quick Rozgar Admin";
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("adminLoggedIn");
    await clear();
    setLoggedIn(false);
  };

  return loggedIn ? (
    <AdminPanel onLogout={handleLogout} />
  ) : (
    <AdminLoginScreen
      onLogin={() => {
        localStorage.setItem("adminLoggedIn", "true");
        setLoggedIn(true);
      }}
    />
  );
}
