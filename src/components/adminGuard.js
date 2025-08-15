// src/components/AdminGuard.js
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AdminGuard({ children }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
        Checking session…
      </div>
    );
  }

  return <>{children}</>;
}