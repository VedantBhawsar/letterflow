"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { motion } from "framer-motion";

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
    gradient: "from-emerald-500/20 to-blue-500/20",
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
      staggerChildren: 0.15,
    },
  },
};

const itemFadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function Blog() {
  return (
    <section
      className="relative py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden"
      id="blog"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="absolute top-40 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block mb-4"
          >
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent text-sm font-medium tracking-wider uppercase">
              Knowledge Hub
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Delve Deeper Into Our Writing Collection
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Explore our knowledge base of articles, guides, and tutorials to help you create better
            newsletters.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {blogPosts.map((post, index) => (
            <motion.div
              key={post.slug}
              variants={itemFadeIn}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="h-full"
            >
              <Card className="overflow-hidden flex flex-col h-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300 rounded-xl">
                <div className="relative h-56 w-full overflow-hidden">
                  {/* Image with zoom effect */}
                  <div className="relative h-full w-full transform transition-transform duration-700 hover:scale-105">
                    <Image src={post.image} alt={post.title} fill className="object-cover" />
                    {/* Gradient overlay */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent opacity-90`}
                    />
                  </div>

                  {/* Post metadata positioned on the image */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
                    <div className="flex items-center space-x-2 text-xs text-slate-300">
                      <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs px-2.5 py-1 rounded-full bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 text-slate-300">
                      <Clock className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>

                <CardHeader className="pb-2 pt-5">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-200">
                    {post.title}
                  </h3>
                </CardHeader>

                <CardContent className="flex-grow pt-0">
                  <p className="text-slate-400">{post.description}</p>
                </CardContent>

                <CardFooter className="border-t border-slate-700/50 pt-4">
                  <Button
                    variant="ghost"
                    className="px-0 group text-emerald-400 hover:text-emerald-300 hover:bg-transparent"
                    asChild
                  >
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

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Button
            size="lg"
            className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/20 transition-all"
            asChild
          >
            <Link href="/blog" className="flex items-center gap-2">
              View All Articles
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
