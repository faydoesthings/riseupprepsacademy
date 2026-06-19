import Link from "next/link";
import { Calendar, ArrowRight, ChevronRight, Newspaper } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import PageHero from "@/components/layout/PageHero";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  createdAt: Date;
};

function formatDate(date: Date, style: "long" | "short" = "long") {
  return date.toLocaleDateString("en-US", {
    month: style === "long" ? "long" : "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogListing({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <main className="bg-[#0A0E1A] overflow-x-hidden">
        <PageHero title="News & Blog" />
        <section className="section-padding">
          <div className="container-main">
            <EmptyState
              icon={Newspaper}
              title="No posts yet"
              description="Check back soon for news and updates from RiseUp Preps Academy."
            />
          </div>
        </section>
      </main>
    );
  }

  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <main className="bg-[#0A0E1A] overflow-x-hidden">
      <PageHero
        eyebrow="Latest updates"
        title="News & Blog"
        description="Stories, milestones, and announcements from the RiseUp community."
      />

      <section className="section-padding">
        <div className="container-main">
          <article className="blog-featured landing-card overflow-hidden">
            <div className="blog-featured__inner">
              <div className="blog-featured__media" aria-hidden>
                <Newspaper className="blog-featured__watermark" strokeWidth={1.25} />
                <span className="badge badge-warning">Featured</span>
              </div>
              <div className="blog-featured__body">
                <time className="blog-card__date" dateTime={featured.createdAt.toISOString()}>
                  <Calendar className="w-4 h-4" aria-hidden />
                  {formatDate(featured.createdAt)}
                </time>
                <h2 className="blog-featured__title">{featured.title}</h2>
                <p className="blog-featured__excerpt">
                  {featured.excerpt || featured.content.slice(0, 220)}
                </p>
                <Link href={`/blog/${featured.slug}`} className="landing-link">
                  Read full article
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </div>
          </article>

          {rest.length > 0 && (
            <div className="blog-grid">
              {rest.map((post) => (
                <article key={post.id} className="blog-card landing-card">
                  <div className="blog-card__header">
                    <span className="badge badge-neutral">News</span>
                    <time className="blog-card__date" dateTime={post.createdAt.toISOString()}>
                      <Calendar className="w-3.5 h-3.5" aria-hidden />
                      {formatDate(post.createdAt, "short")}
                    </time>
                  </div>
                  <h3 className="blog-card__title">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="blog-card__excerpt">
                    {post.excerpt || post.content.slice(0, 120)}
                  </p>
                  <Link href={`/blog/${post.slug}`} className="landing-link text-sm">
                    Read more
                    <ChevronRight className="w-4 h-4" aria-hidden />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
