"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
    gradient: "from-primary/20 to-emerald-500/20",
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

export default function Blog() {
  return (
    <section className="relative py-24" id="blog">
      {/* Enhanced background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/20 to-primary/5 -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(16,185,129,0.08),transparent)] -z-10" />
      <div className="absolute inset-x-0 -top-12 h-40 bg-gradient-to-b from-white to-transparent -z-10" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-1/3 h-1/3 bg-gradient-to-l from-blue-100/30 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-0 w-1/3 h-1/3 bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Delve Deeper Into Our Writing Collection
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore our knowledge base of articles, guides, and tutorials to
            help you create better newsletters.
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
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <Card className="overflow-hidden flex flex-col h-full border-0 shadow-lg hover:shadow-xl transition-all">
                <div className="relative h-52 w-full overflow-hidden rounded-sm">
                  {/* Gradient overlay based on post's gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-tr ${post.gradient} opacity-30 z-10`}
                  />

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
                    <span className="font-medium text-primary">
                      {post.date}
                    </span>
                    <span className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                      {post.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold">{post.title}</h3>
                </CardHeader>

                <CardContent className="flex-grow pt-0">
                  <p className="text-muted-foreground">{post.description}</p>
                </CardContent>

                <CardFooter className="border-t border-border/30 pt-4">
                  <Button variant="link" className="px-0 group" asChild>
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

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
            asChild
          >
            <Link href="/blog" className="flex items-center gap-2">
              View All Articles
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
