"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { motion } from "framer-motion";

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

// Blog post type definition
type BlogPost = {
  id: string;
  title: string;
  description: string;
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

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 9; // Number of posts to display per page

  // Fetch blog posts from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/blog");
        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }
        const data = await response.json();
        setBlogPosts(data);

        // Extract all unique categories and tags
        const categories = Array.from(
          new Set(data.flatMap((post: BlogPost) => post.categories))
        ) as string[];
        const tags = Array.from(new Set(data.flatMap((post: BlogPost) => post.tags))) as string[];

        setAllCategories(categories);
        setAllTags(tags);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Filter blog posts based on search, category, and tag
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      searchTerm === "" ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "" || post.categories.includes(selectedCategory);

    const matchesTag = selectedTag === "" || post.tags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle category selection
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

  // Handle tag selection
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag === selectedTag ? "" : tag);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedTag("");
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5; // Maximum number of page buttons to show
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    if (totalPages <= maxPagesToShow) {
      // If total pages is less than or equal to maxPagesToShow, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of page range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're at the start or end
      if (currentPage <= 2) {
        endPage = Math.min(4, totalPages - 1);
      } else if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }

      // Add ellipsis if needed before the range
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add the page range
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis if needed after the range
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page if there is more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  // Handle page change
  const handlePageChange = (pageNumber: number | string) => {
    if (typeof pageNumber === "number") {
      setCurrentPage(pageNumber);
      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <BlogHeroSection />

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Latest Articles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Sidebar with filters */}
            <div className="space-y-8">
              {/* Search */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Search</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search articles..."
                    className="pl-10 bg-slate-800 border-slate-700 focus:border-emerald-500 focus:ring focus:ring-emerald-500/20"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Categories</h3>
                <div className="space-y-2">
                  {allCategories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className={
                        selectedCategory === category
                          ? "mr-2 mb-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                          : "mr-2 mb-2 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:text-white"
                      }
                      onClick={() => handleCategoryClick(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                  {allCategories.length === 0 && <div className="text-slate-400">Technology</div>}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-white">Tags</h3>
                <div className="flex flex-wrap">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTag === tag ? "secondary" : "outline"}
                      className={
                        selectedTag === tag
                          ? "mr-2 mb-2 cursor-pointer bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
                          : "mr-2 mb-2 cursor-pointer border-slate-700 text-slate-300 bg-slate-800 hover:bg-slate-700"
                      }
                      onClick={() => handleTagClick(tag)}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Clear filters */}
              {(searchTerm || selectedCategory || selectedTag) && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="w-full text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  Clear all filters
                </Button>
              )}
            </div>

            {/* Blog posts grid */}
            <div className="md:col-span-3">
              {loading ? (
                <div className="text-center py-16">
                  <p className="text-slate-400">Loading blog posts...</p>
                </div>
              ) : filteredPosts.length > 0 ? (
                <>
                  <Tabs defaultValue="all">
                    <TabsList className="mb-8 bg-slate-800">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-300"
                      >
                        All Posts
                      </TabsTrigger>
                      <TabsTrigger
                        value="featured"
                        className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-slate-300"
                      >
                        Featured
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      >
                        {filteredPosts
                          .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
                          .map((post) => (
                            <motion.div key={post.slug} variants={itemFadeIn}>
                              <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300 bg-slate-800 border-slate-700/50 hover:border-emerald-500/30 rounded-lg">
                                <div className="relative h-48 w-full overflow-hidden">
                                  {post.image ? (
                                    <Image
                                      src={post.image}
                                      alt={post.title}
                                      fill
                                      className="object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                  ) : (
                                    <div
                                      className={`h-full w-full bg-gradient-to-br ${post.gradient || "from-emerald-500/20 to-slate-700"}`}
                                    />
                                  )}
                                </div>

                                <CardHeader>
                                  <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
                                    <span>
                                      {post.date
                                        ? new Date(post.date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })
                                        : "May 6, 2025"}
                                    </span>
                                    {post.readTime && <span>{post.readTime}</span>}
                                    {!post.readTime && <span>5 min</span>}
                                  </div>
                                  <h3 className="text-xl font-bold text-white">
                                    {post.title || "Sample Post Title"}
                                  </h3>
                                </CardHeader>

                                <CardContent className="flex-grow">
                                  <p className="text-slate-300 mb-4">{post.description}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {post.categories &&
                                      post.categories.map((category) => (
                                        <Badge
                                          key={category}
                                          variant="secondary"
                                          className="text-xs bg-slate-700 text-slate-300"
                                        >
                                          {category}
                                        </Badge>
                                      ))}
                                  </div>
                                </CardContent>

                                <CardFooter className="border-t border-slate-700 pt-4">
                                  <Button
                                    variant="link"
                                    className="px-0 group text-emerald-400"
                                    asChild
                                  >
                                    <Link
                                      href={`/blog/${post.slug}`}
                                      className="flex items-center gap-2"
                                    >
                                      Read Article
                                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                  </Button>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ))}
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="featured">
                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                      >
                        {(filteredPosts.filter((post) => post.featured).length > 0
                          ? filteredPosts.filter((post) => post.featured)
                          : filteredPosts.slice(0, 3)
                        )
                          .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
                          .map((post) => (
                            <motion.div key={post.slug} variants={itemFadeIn}>
                              <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300 bg-slate-800 border-slate-700/50 hover:border-emerald-500/30 rounded-lg">
                                <div className="relative h-48 w-full overflow-hidden">
                                  {post.image ? (
                                    <Image
                                      src={post.image}
                                      alt={post.title}
                                      fill
                                      className="object-cover transition-transform duration-500 hover:scale-105"
                                    />
                                  ) : (
                                    <div
                                      className={`h-full w-full bg-gradient-to-br ${post.gradient || "from-emerald-500/20 to-slate-700"}`}
                                    />
                                  )}
                                </div>

                                <CardHeader>
                                  <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
                                    <span>
                                      {post.date
                                        ? new Date(post.date).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                          })
                                        : "May 6, 2025"}
                                    </span>
                                    {post.readTime && <span>{post.readTime}</span>}
                                    {!post.readTime && <span>5 min</span>}
                                  </div>
                                  <h3 className="text-xl font-bold text-white">
                                    {post.title || "Sample Post Title"}
                                  </h3>
                                </CardHeader>

                                <CardContent className="flex-grow">
                                  <p className="text-slate-300 mb-4">{post.description}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {post.categories &&
                                      post.categories.map((category) => (
                                        <Badge
                                          key={category}
                                          variant="secondary"
                                          className="text-xs bg-slate-700 text-slate-300"
                                        >
                                          {category}
                                        </Badge>
                                      ))}
                                  </div>
                                </CardContent>

                                <CardFooter className="border-t border-slate-700 pt-4">
                                  <Button
                                    variant="link"
                                    className="px-0 group text-emerald-400"
                                    asChild
                                  >
                                    <Link
                                      href={`/blog/${post.slug}`}
                                      className="flex items-center gap-2"
                                    >
                                      Read Article
                                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                  </Button>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          ))}
                      </motion.div>
                    </TabsContent>
                  </Tabs>

                  {/* Pagination */}
                  <div className="mt-16 flex justify-center">
                    <div className="flex space-x-2">
                      {/* Previous button */}
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                        Prev
                      </Button>

                      {/* Page numbers */}
                      {getPageNumbers().map((pageNumber, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className={
                            typeof pageNumber === "number" && pageNumber === currentPage
                              ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700"
                              : pageNumber === "..."
                                ? "cursor-default bg-transparent border-slate-700 text-slate-400"
                                : "bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                          }
                          onClick={() => handlePageChange(pageNumber)}
                          disabled={pageNumber === "..."}
                        >
                          {pageNumber}
                        </Button>
                      ))}

                      {/* Next button */}
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={
                          currentPage === Math.ceil(filteredPosts.length / postsPerPage) ||
                          filteredPosts.length === 0
                        }
                        className="flex items-center gap-1 bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-50"
                      >
                        Next
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-xl font-semibold mb-2 text-white">No articles found</h3>
                  <p className="text-slate-300 mb-6">
                    Try adjusting your search or filter criteria
                  </p>
                  <Button onClick={clearFilters} className="bg-emerald-600 hover:bg-emerald-700">
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

function BlogHeroSection() {
  return (
    <section className="py-20 relative overflow-hidden isolate bg-slate-900">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="h-full w-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-1/3 h-1/3 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-white">
            LetterFlow Blog
          </h1>
          <p className="text-slate-300 text-lg mb-8 leading-relaxed">
            Unlock the secrets to captivating newsletters. Discover insights, expert guides, and
            proven strategies to elevate your content and expand your reach.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
