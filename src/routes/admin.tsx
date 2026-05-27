import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminShell } from "@/components/AdminShell";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (location.pathname === "/admin") throw redirect({ to: "/admin/dashboard" });
  },
  component: () => <AdminShell><Outlet /></AdminShell>,
});
