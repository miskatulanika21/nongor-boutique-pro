import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { ShopProvider } from "@/store/shop";
import { AdminProvider } from "@/store/admin";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="max-w-md text-center">
        <div className="font-display text-7xl text-maroon">404</div>
        <h2 className="mt-4 font-display text-2xl">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">This page has wandered off the loom.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-maroon px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-maroon-deep"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-maroon px-4 py-2 text-sm text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="rounded-md border border-input px-4 py-2 text-sm">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Nongor — Handmade Bangladeshi Kurti & Cultural Fashion" },
      {
        name: "description",
        content:
          "Premium handmade kurti by Bangladeshi artisans. Maroon and antique gold, hand-stitched, cultural elegance.",
      },
      { property: "og:title", content: "Nongor — Handmade Bangladeshi Kurti & Cultural Fashion" },
      {
        property: "og:description",
        content:
          "Premium handmade kurti by Bangladeshi artisans. Maroon and antique gold, hand-stitched, cultural elegance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Nongor — Handmade Bangladeshi Kurti & Cultural Fashion" },
      {
        name: "twitter:description",
        content:
          "Premium handmade kurti by Bangladeshi artisans. Maroon and antique gold, hand-stitched, cultural elegance.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/Bb4ybUMPp4azUvURRKLzzipuBRC2/social-images/social-1779991693226-ChatGPT_Image_May_29,_2026,_12_08_02_AM.webp",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/Bb4ybUMPp4azUvURRKLzzipuBRC2/social-images/social-1779991693226-ChatGPT_Image_May_29,_2026,_12_08_02_AM.webp",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-BD">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminProvider>
          <ShopProvider>
            <Outlet />
            <Toaster position="top-center" />
          </ShopProvider>
        </AdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
