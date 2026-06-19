import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Newspaper, ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import PageHero from "@/components/layout/PageHero";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  let post: Awaited<ReturnType<typeof prisma.blogPost.findFirst>> = null;
  try {
    post = await prisma.blogPost.findFirst({
      where: { slug: params.slug, published: true },
    });
  } catch (error) {
    console.error("Blog post unavailable:", error);
  }

  if (!post) {
    notFound();
  }

  return (
    <main className="bg-[#0A0E1A] overflow-x-hidden">
      <PageHero title={post.title}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-white/55 text-sm">
          <time dateTime={post.createdAt.toISOString()} className="inline-flex items-center gap-2">
            <Calendar className="w-4 h-4" aria-hidden />
            {post.createdAt.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <span className="hidden sm:inline text-white/25" aria-hidden>
            •
          </span>
          <span className="inline-flex items-center gap-2">
            <Newspaper className="w-4 h-4" aria-hidden />
            RiseUp News
          </span>
        </div>
      </PageHero>

      <section className="section-padding">
        <div className="container-main">
          <Link href="/blog" className="landing-link mb-8 inline-flex">
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Back to blog
          </Link>

          <article className="blog-article landing-card">
            {post.excerpt && <p className="blog-article__lede">{post.excerpt}</p>}
            <div className="blog-article__body">{post.content}</div>

            <aside className="blog-article__cta">
              <h3>Want to learn more?</h3>
              <p>Support our mission or connect with our admissions team.</p>
              <div className="blog-article__actions">
                <Link href="/donate" className="btn btn-primary btn-sm min-h-[44px]">
                  Donate now
                </Link>
                <Link href="/contact" className="btn btn-secondary btn-sm min-h-[44px]">
                  Contact us
                </Link>
              </div>
            </aside>
          </article>
        </div>
      </section>
    </main>
  );
}
