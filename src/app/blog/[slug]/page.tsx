"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/sections/Navbar";
import { motion } from "framer-motion";

type BlogPost = {
  id: string;
  title: string;
  description: string;
  content: string;
  image?: string;
  date: string;
  readTime?: string;
  slug: string;
  gradient?: string;
  categories: string[];
  tags: string[];
  featured: boolean;
  userId: string;
  user?: {
    name: string | null;
    image: string | null;
  };
};

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const slug = params.slug as string;
        const response = await fetch(`/api/blog/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Blog post not found");
          }
          throw new Error("Failed to fetch blog post");
        }
        
        const data = await response.json();
        setBlog(data);
      } catch (error) {
        console.error("Error fetching blog:", error);
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchBlog();
    }
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <p className="text-lg">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-muted-foreground mb-6">{error || "Blog post not found"}</p>
          <Button onClick={() => router.push("/blog")}>Back to Blog</Button>
        </div>
      </div>
    );
  }

  // Format the date
  const formattedDate = new Date(blog.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <article className="container mx-auto px-4 py-12">
        {/* Back button */}
        <div className="mb-8">
          <Button variant="ghost" className="group" onClick={() => router.push("/blog")}>
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Blog
          </Button>
        </div>

        {/* Hero section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{blog.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formattedDate}</span>
            </div>
            
            {blog.readTime && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>{blog.readTime}</span>
              </div>
            )}
            
            {blog.user?.name && (
              <div className="flex items-center">
                <span>By {blog.user.name}</span>
              </div>
            )}
          </div>

          {/* Featured image */}
          {blog.image ? (
            <div className="relative w-full h-96 md:h-[500px] rounded-lg overflow-hidden mb-8">
              <Image 
                src={blog.image} 
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className={`w-full h-64 md:h-96 rounded-lg mb-8 bg-gradient-to-br ${blog.gradient || 'from-blue-600/20 to-purple-500/20'}`} />
          )}

          {/* Categories and tags */}
          <div className="flex flex-wrap gap-3 mb-8">
            {blog.categories.map((category) => (
              <Badge key={category} variant="secondary" className="text-sm">
                {category}
              </Badge>
            ))}
            
            {blog.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-sm">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </motion.div>

        {/* Blog content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Render the HTML content from Quill editor */}
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>
        </motion.div>

        {/* Author section (if available) */}
        {blog.user?.name && (
          <div className="mt-16 border-t border-border pt-8">
            <h2 className="text-2xl font-bold mb-4">About the Author</h2>
            <div className="flex items-center gap-4">
              {blog.user.image ? (
                <Image 
                  src={blog.user.image} 
                  alt={blog.user.name || 'Author'}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                  {blog.user.name?.charAt(0) || 'A'}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold">{blog.user.name}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Related posts section would go here */}
      </article>
    </div>
  );
}
