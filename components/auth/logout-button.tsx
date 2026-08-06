"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { LogoutIcon } from "@/components/admin/admin-icons";

interface LogoutButtonProps {
  className?: string;
  showLabel?: boolean;
  collapsed?: boolean;
}

export function LogoutButton({
  className = "",
  showLabel = true,
  collapsed = false,
}: LogoutButtonProps) {
  const router = useRouter();
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  const [loadingComplete, setLoadingComplete] = useState(false);

  function handleLoadingComplete() {
    router.push("/");
    router.refresh();
  }

  async function handleLogout() {
    setShowLoadingScreen(true);
    setLoadingComplete(false);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setLoadingComplete(true);
    } catch {
      setShowLoadingScreen(false);
      setLoadingComplete(false);
    }
  }

  return (
    <>
      {showLoadingScreen ? (
        <AuthLoadingScreen
          label="Signing out..."
          complete={loadingComplete}
          completeHint="Returning to home page..."
          onComplete={handleLoadingComplete}
        />
      ) : null}

      <button
        type="button"
        onClick={handleLogout}
        title={collapsed ? "Log out" : undefined}
        className={className}
      >
        <LogoutIcon />
        {showLabel && !collapsed ? <span>Log out</span> : null}
      </button>
    </>
  );
}
