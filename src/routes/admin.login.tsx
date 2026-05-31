import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/login")({
  beforeLoad: () => {
    // Redirect to the unified login page
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
