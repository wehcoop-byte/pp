import React, { useEffect, Suspense } from "react";
import { useToast } from "../components/ui/ToastProvider";

// Lazy load your landing page component.
// If ../components/landingpage has a default export, this works.
// If it exports named `LandingPage`, we fall back to that.
const LandingPage = React.lazy(async () => {
  const mod = await import("../components/landingpage");
  return { default: (mod as any).default ?? (mod as any).LandingPage ?? mod };
});

export default function Home() {
  const toast = useToast();

  // Fire once in dev to prove the toast system works, but don't machine-gun it.
  useEffect(() => {
    if (import.meta.env.DEV) {
      if ((window as any).__home_toast_fired) return;
      (window as any).__home_toast_fired = true;
      toast.success("Toast system is alive!");
    }
  }, [toast]);

  const Fallback = (
    <div style={{ padding: 32 }}>
      <h1 style={{ color: "white" }}>Pet PawtrAIt</h1>
      <p style={{ color: "lavender" }}>
        Loading…
      </p>
      <button
        onClick={() => toast.info("Still loading…")}
        style={{
          marginTop: 16,
          padding: "12px 18px",
          background: "#F4953E",
          color: "#111",
          borderRadius: 12,
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Ping
      </button>
    </div>
  );

  return (
    <Suspense fallback={Fallback}>
      <LandingPage onStart={() => (window.location.href = "/create")} />
    </Suspense>
  );
}
