import Link from "next/link";
import { ArrowLeft, Calendar, Newspaper } from "lucide-react";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  // Mock blog post data mapping
  const titleMap: Record<string, string> = {
    "riseup-opens-doors-30-students": "RiseUp Preps Academy Opens Doors to 30 New Students",
    "annual-science-fair-2026": "Annual Science Fair 2026 — A Showcase of Young Talent",
    "thank-you-donors-900k-raised": "Thank You to Our Generous Donors — PKR 900,000 Raised",
    "teacher-training-workshop": "Teacher Development Workshop — Empowering Educators",
    "parent-engagement-day": "Parent Engagement Day — Building Bridges Between Home and School",
    "digital-platform-launch": "Launching Our Digital Platform — A New Era for RiseUp",
  };

  const title = titleMap[params.slug] || "Blog Article";

  return (
    <main>
      <section className="relative pt-48 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container-main relative z-10 text-center">
          <Link href="/blog" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/10 text-white/80 hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Blog</span>
          </Link>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 max-w-4xl mx-auto leading-tight">
            {title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-white/70">
            <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> 2026</span>
            <span>•</span>
            <span className="flex items-center gap-2"><Newspaper className="w-4 h-4" /> RiseUp News</span>
          </div>
        </div>
      </section>
      
      <section className="section-padding bg-white">
        <div className="container-main max-w-3xl">
          <div className="prose prose-lg prose-blue mx-auto">
            <p className="lead text-xl text-gray-600 mb-8">
              This is a placeholder article for {title}. In a fully functional environment, this content would be dynamically fetched from the database using the <code>slug</code> parameter.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Education is the cornerstone of societal progress. At RiseUp Preps Academy, we are continually working to expand our impact, support our students, and engage with the community. Every milestone we reach is a testament to the dedication of our teachers, the resilience of our students, and the generosity of our donors.
            </p>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 my-8">
              <h3 className="text-lg font-bold text-[#05335C] mb-2">Want to learn more?</h3>
              <p className="text-sm text-gray-600 mb-4">Support our mission or join our growing community.</p>
              <div className="flex gap-4">
                <Link href="/donate" className="btn btn-primary btn-sm">Donate Now</Link>
                <Link href="/contact" className="btn btn-outline btn-sm">Contact Us</Link>
              </div>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Thank you for reading our updates. Stay tuned for more stories of impact and success from RiseUp Preps Academy.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
