"use client";
import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      let userName = localStorage.getItem("username");
      setUser({ username: userName });
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
      // if (!response.ok) {
      //   throw new Error("Network response was not okk");
      // }
      const result = await response.json();
      console.log("result", result)
      if (result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("username", result.user.username);
        setUser({ username: result.user.username });
        router.push("/home");
      } else {
        toast.error("Invalid Username or Password")
      }
    } catch (error) {
      toast.error("Network Response Was Not Ok!!")
      console.error("Error validating user:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token", "username");
    setUser(null);
    router.push("/login");
  };

  return (
      <AuthContext.Provider value={{ user, login, logout }}>
      {children}
      </AuthContext.Provider>
  );
}
