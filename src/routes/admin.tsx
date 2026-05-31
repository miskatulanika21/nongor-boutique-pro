import {
  createFileRoute,
  Outlet,
  redirect,
  useRouterState,
  useNavigate,
} from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import logo from "@/assets/nongor-logo.png";
import { useEffect } from "react";

const isBrowser = typeof window !== "undefined";

function isAdminAuthenticated(): boolean {
  if (!isBrowser) return false;
  try {
    const v = localStorage.getItem("nongor_admin_auth");
    if (!v) return false;
    return JSON.parse(v).isAdmin === true;
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    // /admin/login redirects to unified login — let it pass through
    if (location.pathname === "/admin/login") return;

    // Redirect /admin → /admin/dashboard
    if (location.pathname === "/admin") throw redirect({ to: "/admin/dashboard" });

    // Auth gate: redirect unauthenticated users to unified login
    if (!isAdminAuthenticated()) throw redirect({ to: "/login" });
  },
  component: AdminLayout,
});

/* ─── Premium loading screen ─── */
function AdminLoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-maroon-deep to-charcoal flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pattern-nakshi opacity-[0.04]" />
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative">
          <motion.div
            className="absolute inset-[-12px] rounded-full border border-gold/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-[-6px] rounded-full border border-dashed border-gold/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
          <motion.img
            src={logo}
            alt="Loading"
            className="h-14 w-14 object-contain"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.35em] text-gold/60 font-semibold">
            Verifying session
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-gold/50"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function AdminLayout() {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const { isLoading, isAdmin } = useAuth();
  const isLoginPage = routerState.location.pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
    if (!isLoading && !isAdmin) {
      navigate({ to: "/login", search: { redirect: routerState.location.pathname } });
    }
  }, [isLoading, isAdmin, navigate, routerState.location.pathname, isLoginPage]);

  if (isLoginPage) {
    return <Outlet />;
  }

  if (isLoading) {
    return <AdminLoadingScreen />;
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
