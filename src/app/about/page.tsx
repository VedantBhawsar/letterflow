"use client";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

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

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col relative bg-slate-900 text-slate-300">
      {/* Main background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 -z-10" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] -z-10">
        <div className="h-full w-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-emerald-500/10 via-transparent to-transparent rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent rounded-full blur-3xl opacity-30" />
      </div>

      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,185,129,0.08),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-16"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                About <span className="text-emerald-400">Letterflow</span>
              </h1>
              <p className="text-xl text-slate-400">
                We&apos;re on a mission to empower newsletter creators with powerful tools,
                insightful analytics, and beautiful designs.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Story */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_60%,rgba(16,185,129,0.1),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.h2
                className="text-3xl font-bold mb-8 text-center text-white"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Our Story
              </motion.h2>
              <motion.div
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 mb-12 shadow-lg shadow-emerald-900/5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
              >
                <div className="prose prose-invert max-w-none">
                  <p className="text-lg text-slate-300">
                    Letterflow was born in 2021 when our founders, experienced newsletter creators
                    themselves, recognized a gap in the market. While there were many email
                    marketing platforms available, none were specifically designed for the unique
                    needs of newsletter creators.
                  </p>
                  <p className="text-lg text-slate-300">
                    We set out to build a platform that would provide the perfect balance of
                    powerful features, intuitive design, and meaningful analytics to help creators
                    grow their audience and improve their content.
                  </p>
                  <p className="text-lg text-slate-300">
                    What started as a small team of three has now grown into a diverse company of
                    passionate individuals dedicated to supporting the thriving newsletter
                    ecosystem.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission and Values */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 -z-10" />
          <div className="absolute inset-y-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/5 to-transparent -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4 text-white">Our Mission & Values</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                The principles that guide our product decisions, team culture, and customer
                relationships.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 shadow-lg shadow-emerald-900/5 hover:border-emerald-500/30 transition-colors"
                variants={itemFadeIn}
                whileHover={{ y: -5 }}
              >
                <h3 className="text-xl font-bold mb-4 text-emerald-400">Empowering Creators</h3>
                <p className="text-slate-300">
                  We believe in democratizing publishing by providing tools that enable anyone to
                  create professional, engaging newsletters regardless of technical expertise.
                </p>
              </motion.div>
              <motion.div
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 shadow-lg shadow-emerald-900/5 hover:border-emerald-500/30 transition-colors"
                variants={itemFadeIn}
                whileHover={{ y: -5 }}
              >
                <h3 className="text-xl font-bold mb-4 text-emerald-400">Data-Driven Insights</h3>
                <p className="text-slate-300">
                  We&apos;re committed to providing actionable analytics that help creators
                  understand their audience and optimize their content strategy.
                </p>
              </motion.div>
              <motion.div
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 shadow-lg shadow-emerald-900/5 hover:border-emerald-500/30 transition-colors"
                variants={itemFadeIn}
                whileHover={{ y: -5 }}
              >
                <h3 className="text-xl font-bold mb-4 text-emerald-400">Design Excellence</h3>
                <p className="text-slate-300">
                  Beautiful, functional design is at the heart of our product. We believe
                  newsletters should be as visually appealing as they are informative.
                </p>
              </motion.div>
              <motion.div
                className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 shadow-lg shadow-emerald-900/5 hover:border-emerald-500/30 transition-colors"
                variants={itemFadeIn}
                whileHover={{ y: -5 }}
              >
                <h3 className="text-xl font-bold mb-4 text-emerald-400">Creator-First Support</h3>
                <p className="text-slate-300">
                  Our customer support team is made up of experienced newsletter creators who
                  understand your challenges and can provide real, practical advice.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 -z-10" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4 text-white">Meet Our Team</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                The passionate people behind Letterflow who are dedicated to helping newsletter
                creators succeed.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {[
                {
                  name: "Alex Rodriguez",
                  role: "Co-Founder & CEO",
                  bio: "Former newsletter creator with over 100,000 subscribers. Alex brings a deep understanding of creators' needs.",
                  image:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop&auto=format",
                },
                {
                  name: "Jamie Chen",
                  role: "Co-Founder & CTO",
                  bio: "Tech veteran who previously built publishing tools at major tech companies. Focused on making complex technology accessible.",
                  image:
                    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=256&h=256&fit=crop&auto=format",
                },
                {
                  name: "Taylor Morgan",
                  role: "Co-Founder & Head of Product",
                  bio: "Product designer with a background in UX research. Passionate about creating intuitive, beautiful newsletter experiences.",
                  image:
                    "https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=256&h=256&fit=crop&auto=format",
                },
                {
                  name: "Sam Wilson",
                  role: "Lead Developer",
                  bio: "Full-stack engineer who specializes in creating scalable, high-performance web applications.",
                  image:
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&h=256&fit=crop&auto=format",
                },
                {
                  name: "Nia Johnson",
                  role: "Head of Customer Success",
                  bio: "Former newsletter strategist who has helped dozens of publications grow their audiences and engagement.",
                  image:
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop&auto=format",
                },
                {
                  name: "Raj Patel",
                  role: "Analytics Lead",
                  bio: "Data scientist with expertise in audience analytics and content optimization for digital publishers.",
                  image:
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&fit=crop&auto=format",
                },
              ].map((member, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 flex flex-col items-center text-center shadow-lg shadow-emerald-900/5 hover:border-emerald-500/30 transition-colors"
                  variants={itemFadeIn}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-24 h-24 rounded-full mb-4 overflow-hidden border-2 border-emerald-500/20">
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg text-white">{member.name}</h3>
                  <p className="text-emerald-400 text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-slate-400 text-sm">{member.bio}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Milestones */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(16,185,129,0.08),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4 text-white">Our Journey</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Key milestones in the Letterflow story as we&apos;ve grown and evolved.
              </p>
            </motion.div>

            <div className="max-w-3xl mx-auto">
              <motion.div
                className="space-y-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                {[
                  {
                    year: "2021",
                    title: "Letterflow Founded",
                    description:
                      "Three newsletter creators come together to build the platform they always wanted.",
                  },
                  {
                    year: "2021",
                    title: "First Beta Release",
                    description:
                      "The initial version launches with 100 beta testers providing valuable feedback.",
                  },
                  {
                    year: "2022",
                    title: "Public Launch",
                    description:
                      "Letterflow opens to the public with our core email builder and analytics features.",
                  },
                  {
                    year: "2022",
                    title: "1,000 Active Creators",
                    description:
                      "We reach our first major milestone of 1,000 newsletter creators using the platform.",
                  },
                  {
                    year: "2023",
                    title: "Advanced Analytics Suite",
                    description:
                      "Launch of our comprehensive analytics features to help creators deeply understand their audience.",
                  },
                  {
                    year: "2023",
                    title: "10,000 Active Creators",
                    description:
                      "Letterflow continues to grow, now serving 10,000 newsletter creators worldwide.",
                  },
                  {
                    year: "2024",
                    title: "Team Expansion",
                    description:
                      "Our team grows to 25 people across product, engineering, design, and customer success.",
                  },
                  {
                    year: "Today",
                    title: "Constant Improvement",
                    description:
                      "We continue to enhance the platform based on creator feedback and emerging industry needs.",
                  },
                ].map((milestone, index) => (
                  <motion.div key={index} className="flex gap-4" variants={itemFadeIn}>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center font-semibold text-emerald-400">
                        {milestone.year}
                      </div>
                      {index < 7 && <div className="w-0.5 h-16 bg-slate-700/50 mt-2"></div>}
                    </div>
                    <div className="pt-2">
                      <h3 className="font-semibold text-lg text-white">{milestone.title}</h3>
                      <p className="text-slate-400">{milestone.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,185,129,0.1),transparent)] -z-10" />

          <div className="container mx-auto px-4 text-center">
            <motion.div
              className="relative max-w-2xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-600/20 rounded-xl blur-lg opacity-70"></div>
              <div className="relative backdrop-blur-sm bg-slate-800/90 border border-slate-700/50 p-8 rounded-xl shadow-lg shadow-emerald-900/5">
                <h2 className="text-3xl font-bold mb-4 text-white">Join Our Team</h2>
                <p className="text-lg text-slate-300 max-w-xl mx-auto mb-6">
                  We&apos;re always looking for passionate, talented people to help us build the
                  future of newsletters.
                </p>
                <Button
                  size="lg"
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-6 shadow-md shadow-emerald-500/20"
                >
                  <Link href="/careers" className="flex items-center gap-2">
                    <span>View Open Positions</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
