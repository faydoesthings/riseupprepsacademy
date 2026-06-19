import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import BlogListing from "@/components/blog/BlogListing";

export const metadata: Metadata = {
  title: "News & Blog — RiseUp Preps Academy",
  description: "Latest news, updates, and stories from RiseUp Preps Academy.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof prisma.blogPost.findMany>> = [];
  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Blog posts unavailable:", error);
  }

  return <BlogListing posts={posts} />;
}
