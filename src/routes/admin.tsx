import { createFileRoute, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";

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
    // /admin/login is completely unguarded — never redirect from it
    if (location.pathname === "/admin/login") return;

    // Redirect /admin → /admin/dashboard
    if (location.pathname === "/admin") throw redirect({ to: "/admin/dashboard" });

    // Auth gate: redirect unauthenticated users to login
    // This uses localStorage as a fast synchronous check.
    // The real Supabase session is verified async in AdminProvider.
    if (!isAdminAuthenticated()) throw redirect({ to: "/admin/login" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const routerState = useRouterState();
  const isLoginPage = routerState.location.pathname === "/admin/login";

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
