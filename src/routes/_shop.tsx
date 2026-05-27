import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { Navbar, MobileBottomNav } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/_shop")({
  component: ShopLayout,
});

function ShopLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Navbar />
      <main className="flex-1 pb-28 md:pb-0 animate-fade-up" key={path}>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
