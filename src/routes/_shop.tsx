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
      <main className="flex-1 pb-20 md:pb-0" key={path}>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
