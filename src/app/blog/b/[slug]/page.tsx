"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Share2, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Navbar from "@/components/sections/Navbar";
import { useParams } from "next/navigation";

// Blog posts data (in a real app, this would come from a CMS or API)
const blogPosts = [
  {
    title: "Content Strategy Essentials",
    description:
      "Learn the fundamentals of creating a content strategy that drives newsletter growth and engagement.",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop",
    date: "April 12, 2023",
    readTime: "8 min read",
    slug: "content-strategy-essentials",
    gradient: "from-blue-600/20 to-purple-500/20",
    categories: ["Strategy", "Growth"],
    tags: ["content strategy", "newsletter growth", "engagement"],
    featured: true,
    author: {
      name: "Sarah Johnson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      role: "Content Strategist",
    },
    content: `
      <h2>Why Content Strategy Matters for Newsletters</h2>
      <p>In the crowded digital landscape, having a clear content strategy is essential for newsletter success. A well-defined strategy helps you maintain consistency, meet audience expectations, and achieve your business goals.</p>
      
      <p>Content strategy for newsletters encompasses several key elements:</p>
      <ul>
        <li><strong>Audience understanding:</strong> Knowing who you're writing for and what they need</li>
        <li><strong>Value proposition:</strong> Defining what makes your newsletter unique</li>
        <li><strong>Content mix:</strong> Planning the types of content you'll include</li>
        <li><strong>Voice and tone:</strong> Establishing a consistent writing style</li>
        <li><strong>Publishing cadence:</strong> Determining how often you'll send your newsletter</li>
      </ul>
      
      <h2>Building Your Newsletter Content Strategy</h2>
      <p>Follow these steps to create an effective content strategy for your newsletter:</p>
      
      <h3>1. Define Your Audience</h3>
      <p>Start by creating detailed personas of your ideal subscribers. Consider their demographics, interests, pain points, and goals. What problems are they trying to solve? What information do they need? The more specific you can be, the better you can tailor your content.</p>
      
      <h3>2. Establish Clear Goals</h3>
      <p>What do you want to achieve with your newsletter? Common goals include:</p>
      <ul>
        <li>Building brand awareness</li>
        <li>Establishing thought leadership</li>
        <li>Generating leads</li>
        <li>Driving traffic to your website</li>
        <li>Increasing product sales</li>
      </ul>
      <p>Your goals will influence the type of content you create and how you measure success.</p>
      
      <h3>3. Develop Your Content Pillars</h3>
      <p>Content pillars are the main themes or topics you'll cover in your newsletter. They should align with your expertise and your audience's interests. For example, a marketing newsletter might have pillars like social media, content marketing, SEO, and analytics.</p>
      
      <h3>4. Plan Your Content Mix</h3>
      <p>Variety keeps your newsletter engaging. Consider including:</p>
      <ul>
        <li>Original articles</li>
        <li>Curated industry news</li>
        <li>Tips and how-tos</li>
        <li>Case studies</li>
        <li>Q&As or interviews</li>
        <li>Product updates or announcements</li>
      </ul>
      
      <h3>5. Create an Editorial Calendar</h3>
      <p>An editorial calendar helps you plan your content in advance, maintain consistency, and align with important dates or events in your industry. It should include topics, publishing dates, and any special themes or promotions.</p>
      
      <h2>Measuring Success</h2>
      <p>To evaluate the effectiveness of your content strategy, track these key metrics:</p>
      <ul>
        <li><strong>Open rate:</strong> The percentage of subscribers who open your newsletter</li>
        <li><strong>Click-through rate:</strong> The percentage of readers who click on links</li>
        <li><strong>Growth rate:</strong> How quickly your subscriber list is growing</li>
        <li><strong>Conversion rate:</strong> The percentage of readers who take a desired action</li>
        <li><strong>Unsubscribe rate:</strong> The percentage of subscribers who opt out</li>
      </ul>
      
      <p>Regularly review these metrics and adjust your strategy as needed to improve performance.</p>
      
      <h2>Conclusion</h2>
      <p>A thoughtful content strategy is the foundation of a successful newsletter. By understanding your audience, setting clear goals, and planning your content intentionally, you can create a newsletter that resonates with readers and achieves your business objectives.</p>
      
      <p>Remember that your strategy should evolve as you learn more about your audience and as your business grows. Regularly review your performance metrics and be willing to experiment with new approaches to keep your newsletter fresh and engaging.</p>
    `,
  },
  {
    title: "Email Marketing Demystified",
    description:
      "Discover the secrets behind successful email marketing campaigns and how to apply them to your newsletter.",
    image:
      "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=1000&auto=format&fit=crop",
    date: "March 28, 2023",
    readTime: "6 min read",
    slug: "email-marketing-demystified",
    gradient: "from-primary/20 to-emerald-500/20",
    categories: ["Marketing", "Email"],
    tags: ["email marketing", "campaigns", "newsletter"],
    featured: true,
    author: {
      name: "Michael Chen",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      role: "Email Marketing Specialist",
    },
    content: `<p>Content for email marketing article...</p>`,
  },
  {
    title: "Productivity Hacks for Writers",
    description:
      "Boost your writing productivity with these proven techniques and tools for newsletter creators.",
    image:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?q=80&w=1000&auto=format&fit=crop",
    date: "March 15, 2023",
    readTime: "5 min read",
    slug: "productivity-hacks-writers",
    gradient: "from-amber-500/20 to-rose-500/20",
    categories: ["Productivity", "Writing"],
    tags: ["productivity", "writing", "tools"],
    featured: false,
    author: {
      name: "Alex Rivera",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      role: "Content Creator",
    },
    content: `<p>Content for productivity hacks article...</p>`,
  },
  {
    title: "The Art of Newsletter Design",
    description:
      "Create visually stunning newsletters that capture attention and drive engagement with these design principles.",
    image:
      "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1000&auto=format&fit=crop",
    date: "February 28, 2023",
    readTime: "7 min read",
    slug: "art-of-newsletter-design",
    gradient: "from-pink-500/20 to-yellow-500/20",
    categories: ["Design", "Creativity"],
    tags: ["design", "visual", "layout", "creativity"],
    featured: false,
    author: {
      name: "Jordan Taylor",
      avatar: "https://randomuser.me/api/portraits/men/55.jpg",
      role: "UI/UX Designer",
    },
    content: `<p>Content for newsletter design article...</p>`,
  },
  {
    title: "Building Your Subscriber Base",
    description:
      "Strategies and tactics to grow your newsletter subscriber base organically and through paid channels.",
    image:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop",
    date: "February 15, 2023",
    readTime: "9 min read",
    slug: "building-subscriber-base",
    gradient: "from-green-500/20 to-blue-500/20",
    categories: ["Growth", "Marketing"],
    tags: ["subscribers", "growth", "audience building"],
    featured: true,
    author: {
      name: "Priya Patel",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      role: "Growth Marketer",
    },
    content: `<p>Content for subscriber base article...</p>`,
  },
  {
    title: "Monetizing Your Newsletter",
    description:
      "Explore different revenue models and strategies to turn your newsletter into a profitable business.",
    image:
      "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1000&auto=format&fit=crop",
    date: "January 30, 2023",
    readTime: "10 min read",
    slug: "monetizing-your-newsletter",
    gradient: "from-purple-500/20 to-red-500/20",
    categories: ["Business", "Monetization"],
    tags: ["monetization", "revenue", "business model"],
    featured: false,
    author: {
      name: "David Wilson",
      avatar: "https://randomuser.me/api/portraits/men/41.jpg",
      role: "Business Strategist",
    },
    content: `<p>Content for monetization article...</p>`,
  },
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function BlogPost() {
  const [post, setPost] = useState<any>(null);
  const params = useParams();
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be an API call
    const foundPost = blogPosts.find((post) => post.slug === params.slug);
    setPost(foundPost || null);

    // Find related posts based on categories and tags
    if (foundPost) {
      const related = blogPosts
        .filter(
          (p) =>
            p.slug !== params.slug && // Not the current post
            (p.categories.some((cat) => foundPost.categories.includes(cat)) || // Shares a category
              p.tags.some((tag) => foundPost.tags.includes(tag))) // Shares a tag
        )
        .slice(0, 3); // Limit to 3 related posts

      setRelatedPosts(related);
    }

    setLoading(false);
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The article you're looking for doesn't exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/blog">Back to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-primary/5">
      <Navbar />
      {/* Header section with image */}
      <div className="relative h-[50vh] w-full">
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-tr ${post.gradient} opacity-30 z-10`} />

        {/* Image */}
        <Image src={post.image} alt={post.title} fill className="object-cover" priority />

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-20" />

        {/* Post title and metadata */}
        <div className="absolute bottom-0 left-0 right-0 z-30 container mx-auto px-4 pb-12">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <Button variant="outline" size="sm" className="bg-white/90 mb-4" asChild>
              <Link href="/blog" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Link>
            </Button>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/90 mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {post.categories.map((category: string) => (
                <Badge key={category} className="bg-white/20 hover:bg-white/30 text-white">
                  {category}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article content */}
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white rounded-xl shadow-lg p-8"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {/* Author info */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={60}
                  height={60}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-bold">{post.author.name}</h3>
                  <p className="text-muted-foreground text-sm">{post.author.role}</p>
                </div>
              </div>

              {/* Article body */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Share */}
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-primary" />
                  Share this article
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Twitter
                  </Button>
                  <Button variant="outline" size="sm">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm">
                    LinkedIn
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div>
            <motion.div
              className="sticky top-24"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {/* Related posts */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="font-bold text-lg mb-4">Related Articles</h3>

                {relatedPosts.length > 0 ? (
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <Card
                        key={relatedPost.slug}
                        className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="relative h-32 w-full">
                          <Image
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            fill
                            className="object-cover"
                          />
                          <div
                            className={`absolute inset-0 bg-gradient-to-tr ${relatedPost.gradient} opacity-30`}
                          />
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-1 line-clamp-1">{relatedPost.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {relatedPost.description}
                          </p>
                          <Button variant="link" className="p-0 h-auto text-primary" asChild>
                            <Link
                              href={`/blog/${relatedPost.slug}`}
                              className="flex items-center gap-1 text-sm"
                            >
                              Read more
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No related articles found.</p>
                )}
              </div>

              {/* Newsletter signup */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-2">Subscribe to our Newsletter</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the latest articles and insights delivered to your inbox.
                </p>
                <Button className="w-full bg-primary hover:bg-primary/90">Subscribe Now</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
