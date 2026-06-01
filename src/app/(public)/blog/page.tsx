import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper, Calendar, ArrowRight, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "News & Blog — RiseUp Preps Academy",
  description: "Latest news, updates, and stories from RiseUp Preps Academy.",
};

const posts = [
  {
    slug: "riseup-opens-doors-30-students",
    title: "RiseUp Preps Academy Opens Doors to 30 New Students",
    excerpt: "We are thrilled to announce that RiseUp Preps Academy has welcomed 30 new students this academic year, expanding our mission to educate Sindh.",
    date: "May 10, 2026",
    category: "Announcement",
    readTime: "3 min read",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    slug: "annual-science-fair-2026",
    title: "Annual Science Fair 2026 — A Showcase of Young Talent",
    excerpt: "Our students showcased incredible projects at the Annual Science Fair, from solar-powered water purifiers to biodegradable packaging solutions.",
    date: "April 25, 2026",
    category: "Events",
    readTime: "4 min read",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    slug: "thank-you-donors-900k-raised",
    title: "Thank You to Our Generous Donors — PKR 900,000 Raised",
    excerpt: "We extend our heartfelt gratitude to all our donors who have collectively contributed over PKR 900,000 to support our students.",
    date: "April 15, 2026",
    category: "Milestone",
    readTime: "2 min read",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    slug: "teacher-training-workshop",
    title: "Teacher Development Workshop — Empowering Educators",
    excerpt: "Our teaching team participated in a comprehensive 3-day professional development workshop focused on modern teaching methodologies.",
    date: "March 20, 2026",
    category: "Education",
    readTime: "3 min read",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    slug: "parent-engagement-day",
    title: "Parent Engagement Day — Building Bridges Between Home and School",
    excerpt: "We hosted our first Parent Engagement Day, bringing families and teachers together to discuss student progress and academy plans.",
    date: "March 5, 2026",
    category: "Community",
    readTime: "3 min read",
    gradient: "from-blue-600 to-indigo-500",
  },
  {
    slug: "digital-platform-launch",
    title: "Launching Our Digital Platform — A New Era for RiseUp",
    excerpt: "RiseUp Preps Academy is going digital! Our new integrated platform brings together student management, finance, and donor engagement.",
    date: "February 15, 2026",
    category: "Technology",
    readTime: "5 min read",
    gradient: "from-red-500 to-pink-500",
  },
];

export default function BlogPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative pt-48 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[400px] h-[400px] rounded-full bg-[#F78C1F]/10 blur-3xl" />
        </div>
        <div className="container-main relative z-10 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/10">
            <Newspaper className="w-4 h-4 text-[#F78C1F]" />
            <span className="text-sm text-white/80 font-medium">Latest Updates</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            News & Blog
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Stay updated with the latest news, events, and stories from RiseUp Preps Academy.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="section-padding bg-white">
        <div className="container-main">
          {/* Featured Post */}
          <div className="card-elevated overflow-hidden mb-12">
            <div className="grid md:grid-cols-2">
              <div className={`bg-gradient-to-br ${posts[0].gradient} p-8 md:p-12 flex flex-col justify-center min-h-[300px]`}>
                <span className="badge badge-warning mb-4 w-fit">{posts[0].category}</span>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{posts[0].title}</h2>
                <div className="flex items-center gap-4 text-white/70 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {posts[0].date}
                  </span>
                  <span>{posts[0].readTime}</span>
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <p className="text-gray-600 leading-relaxed mb-6">{posts[0].excerpt}</p>
                <Link href={`/blog/${posts[0].slug}`} className="inline-flex items-center gap-2 text-[#F78C1F] font-semibold hover:gap-3 transition-all">
                  Read Full Article <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Post Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post, i) => (
              <article key={i} className="card-elevated overflow-hidden group">
                <div className={`bg-gradient-to-br ${post.gradient} p-6 h-40 flex items-end relative overflow-hidden`}>
                  <Newspaper className="absolute -top-4 -right-4 w-32 h-32 text-white/20 transform rotate-12" />
                  <span className="badge badge-warning relative z-10">{post.category}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#05335C] mb-3 group-hover:text-[#F78C1F] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-3">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-2 text-[#F78C1F] font-semibold text-sm group-hover:gap-3 transition-all">
                    Read More <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
