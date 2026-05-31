import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/ui";

export const Route = createFileRoute("/admin/content")({ component: Page });

function Page() {
  return (
    <div>
      <PageHeader title="Homepage Content" subtitle="Manage banners, sections and storytelling" />
      <div className="grid lg:grid-cols-2 gap-4">
        {[
          { title: "Hero Banner", desc: "Main homepage headline + CTA" },
          { title: "Announcement Bar", desc: "Top promo strip" },
          { title: "Featured Products", desc: "Highlighted on homepage" },
          { title: "Featured Categories", desc: "Collection tiles" },
          { title: "Promotional Banners", desc: "Mid-page promos" },
          { title: "Testimonials", desc: "Customer love" },
          { title: "Brand Story", desc: "About Nongor section" },
          { title: "Lookbook", desc: "Inspiration gallery" },
        ].map((s) => (
          <div key={s.title} className="bg-card rounded-xl p-5 border border-border/60">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-lg">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
              </div>
              <button className="bg-secondary px-3 py-1.5 rounded-lg text-xs font-semibold">
                Edit
              </button>
            </div>
            <div className="mt-4 aspect-[3/1] bg-secondary rounded-lg grid place-items-center text-muted-foreground text-xs">
              Preview placeholder
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
