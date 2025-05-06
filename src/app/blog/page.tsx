"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Router, Search, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/sections/Navbar";
import { motion } from "framer-motion";

const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Stagger animation of children
      delayChildren: 0.1, // Delay before children start
      duration: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.6,
    },
  },
};

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

const itemFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

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
  },
];

// Extract all unique categories and tags
const allCategories = Array.from(new Set(blogPosts.flatMap((post) => post.categories)));
const allTags = Array.from(new Set(blogPosts.flatMap((post) => post.tags)));

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Filter posts based on search query, category, and tag
  const filteredPosts = blogPosts.filter((post) => {
    // Filter by search query
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by category
    const matchesCategory = selectedCategory === null || post.categories.includes(selectedCategory);

    // Filter by tag
    const matchesTag = selectedTag === null || post.tags.includes(selectedTag);

    // Filter by tab
    const matchesTab = activeTab === "all" || (activeTab === "featured" && post.featured);

    return matchesSearch && matchesCategory && matchesTag && matchesTab;
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle category selection
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  // Handle tag selection
  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedTag(null);
    setActiveTab("all");
  };

  return (
    <div className="min-h-screen smooth-scroll bg-gradient-to-b from-white via-blue-50/20 to-primary/5">
      {/* Header section */}
      <Navbar />
      <BlogHeroSectionV1 />
      {/* Filter and search section */}
      <section id={"explore"} className="py-8 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            {/* Search input */}
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            {/* Tabs */}
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full md:w-auto"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Posts</TabsTrigger>
                <TabsTrigger value="featured">Featured</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Categories */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Categories:</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Popular Tags:</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 8).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => handleTagClick(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Active filters */}
          {(searchQuery || selectedCategory || selectedTag || activeTab !== "all") && (
            <div className="mt-6 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchQuery}
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {selectedCategory}
                </Badge>
              )}
              {selectedTag && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Tag: {selectedTag}
                </Badge>
              )}
              {activeTab === "featured" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Featured only
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2">
                Clear all
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Blog posts grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredPosts.length > 0 ? (
            <>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.slug}
                    variants={itemFadeIn}
                    whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  >
                    <Card className="overflow-hidden flex flex-col h-full border-0 shadow-lg hover:shadow-xl transition-all">
                      <div className="relative h-52 w-full overflow-hidden rounded-sm">
                        {/* Gradient overlay based on post's gradient */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-tr ${post.gradient} opacity-30 z-10`}
                        />

                        {/* Featured badge */}
                        {post.featured && (
                          <div className="absolute top-2 right-2 z-20">
                            <Badge className="bg-primary text-white">Featured</Badge>
                          </div>
                        )}

                        {/* Image with zoom effect on hover */}
                        <div className="relative h-full w-full transform transition-transform duration-700 hover:scale-110 rounded-2xl">
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover rounded-b-2xl"
                          />
                        </div>

                        {/* Gradient overlay at bottom for better text readability */}
                        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 to-transparent z-20" />
                      </div>

                      <CardHeader className="relative z-30 bg-white rounded-t-2xl pb-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                          <span className="font-medium text-primary">{post.date}</span>
                          <span className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold">{post.title}</h3>
                      </CardHeader>

                      <CardContent className="flex-grow pt-0">
                        <p className="text-muted-foreground">{post.description}</p>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {post.categories.map((category) => (
                            <Badge key={category} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>

                      <CardFooter className="border-t border-border/30 pt-4">
                        <Button variant="link" className="px-0 group" asChild>
                          <Link href={`/blog/${post.slug}`} className="flex items-center gap-2">
                            Read Article
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination (simplified) */}
              <div className="mt-16 flex justify-center">
                <div className="flex space-x-2">
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" className="bg-primary text-white">
                    1
                  </Button>
                  <Button variant="outline">2</Button>
                  <Button variant="outline">3</Button>
                  <Button variant="outline">Next</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold mb-2">No articles found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export function BlogHeroSectionV1() {
  return (
    <section className="py-14 relative overflow-hidden isolate">
      {" "}
      {/* isolate for z-index stacking */}
      {/* Enhanced Background Gradient - softer and more spread */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_calc(100%-20px),rgba(16,185,129,0.1),transparent_70%)]"
        aria-hidden="true"
      />
      {/* Optional: Add a very subtle grain texture or soft noise pattern if desired */}
      <div className="absolute inset-0 -z-20 opacity-5 bg-[repeating-linear-gradient(0deg,#f0f0f0,#f0f0f0_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(0deg,#222,#222_1px,transparent_1px,transparent_5px)]" />
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible" // Animate when in view
          viewport={{ once: true, amount: 0.3 }} // Trigger once, when 30% is visible
          variants={heroVariants}
        >
          <motion.h1
            className="text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-slate-700 to-emerald-600 leading-tight"
            variants={itemVariants}
          >
            LetterFlow Blog
          </motion.h1>
          <motion.p
            className="italic text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Unlock the secrets to captivating newsletters. Discover insights, expert guides, and
            proven strategies to elevate your content and expand your reach.
          </motion.p>
          {/* Optional Call to Action */}
          <motion.div variants={itemVariants}>
            <Link href="#explore">
              <Button className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:bg-emerald-700 transition-colors duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                Explore Articles
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
