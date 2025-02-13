"use client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

export default function Home() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    if (user !== null) {
      setLoading(false);
      if (user) {
        router.push("/home");
      } else {
        router.push("/login");
      }
    }
  }, [user, router]);

  if (loading) return <div className="h-full"><LoaderCircle className="loadingSpinner mx-auto" /></div>;

  return null;
}
