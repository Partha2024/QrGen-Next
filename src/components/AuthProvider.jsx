"use client";
import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    // console.log("AuthProvider - token - " , token);
    if (token) {
      setUser({ username: "admin" });
    } else {
      setUser(null);
      router.push("/login");
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      console.log("result", result)
      if (result.token) {
        localStorage.setItem("token", result.token);
        setUser({ username: result.user.username });
        router.push("/home");
      } else {
        alert("Invalid credentials");
      }
    } catch (error) {
      console.error("Error fetching QR codes:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
      <AuthContext.Provider value={{ user, login, logout }}>
      {children}
      </AuthContext.Provider>
  );
}
