"use client";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Layout,
  MousePointer,
  LayoutTemplate,
  Users,
  TestTube,
  LineChart,
  BarChart,
  Laptop,
  Zap,
  ShieldCheck,
  Globe,
  Sparkles,
  ArrowRight,
} from "lucide-react";

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

export default function FeaturesPage() {
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
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,185,129,0.08),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-12 md:mb-16"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 rounded-full px-3 py-1 text-sm font-medium mb-6 border border-emerald-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Features Overview</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
                Powerful Features for <span className="text-emerald-400">Newsletter Creators</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400">
                Everything you need to create, grow, and monetize your newsletter in one platform.
              </p>
            </motion.div>

            <motion.div
              className="max-w-6xl mx-auto mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl shadow-emerald-500/5">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-slate-900 to-slate-900"></div>
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                  alt="Letterflow Dashboard"
                  width={1200}
                  height={600}
                  className="w-full h-auto relative z-10 opacity-90"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Email Builder Features */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_60%,rgba(16,185,129,0.1),transparent)] -z-10" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4 text-white">Email Builder</h2>
              <p className="text-lg text-slate-400">
                Create beautiful newsletters without writing a single line of code.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <motion.div
                className="order-2 lg:order-1 relative lg:col-span-7"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
              >
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-emerald-700/30 blur-lg opacity-60"></div>
                <div className="relative rounded-xl border border-slate-700/50 bg-slate-800 overflow-hidden shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=2070&auto=format&fit=crop"
                    alt="Email Builder Interface"
                    width={640}
                    height={480}
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>

              <motion.div
                className="order-1 lg:order-2 space-y-8 lg:col-span-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                <div className="space-y-6">
                  {[
                    {
                      icon: <MousePointer className="h-5 w-5" />,
                      title: "Drag & Drop Builder",
                      description:
                        "Create beautiful emails with our intuitive drag and drop interface.",
                    },
                    {
                      icon: <LayoutTemplate className="h-5 w-5" />,
                      title: "1,000+ Templates",
                      description: "Access our library of professionally designed email templates.",
                    },
                    {
                      icon: <Users className="h-5 w-5" />,
                      title: "Nested Segmentation",
                      description: "Target the right audience with advanced segmentation options.",
                    },
                    {
                      icon: <TestTube className="h-5 w-5" />,
                      title: "A/B User Testing",
                      description: "Optimize your emails with data-driven A/B testing.",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4 group"
                      variants={itemFadeIn}
                    >
                      <div className="flex-shrink-0 rounded-full bg-emerald-500/20 p-3 text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-white text-lg mb-1">{feature.title}</h3>
                        <p className="text-slate-400">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Analytics Features */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 -z-10" />
          <div className="absolute inset-y-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/5 to-transparent -z-10" />
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-1/4 left-0 w-1/3 h-1/2 bg-gradient-to-r from-emerald-500/5 to-transparent blur-3xl opacity-30" />
          </div>

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4 text-white">Analytics & Insights</h2>
              <p className="text-lg text-slate-400">
                Understand your audience and optimize your content with detailed analytics.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <motion.div
                className="space-y-8 lg:col-span-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                <div className="space-y-6">
                  {[
                    {
                      icon: <LineChart className="h-5 w-5" />,
                      title: "Growth Tracking",
                      description: "Monitor subscriber growth over time with interactive charts.",
                    },
                    {
                      icon: <BarChart className="h-5 w-5" />,
                      title: "Engagement Analytics",
                      description:
                        "Track opens, clicks, and other key metrics to understand what resonates with your audience.",
                    },
                    {
                      icon: <Users className="h-5 w-5" />,
                      title: "Audience Insights",
                      description:
                        "Learn more about your subscribers with demographic and behavioral data.",
                    },
                    {
                      icon: <Layout className="h-5 w-5" />,
                      title: "Custom Reports",
                      description:
                        "Create and export custom reports to share with your team or sponsors.",
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4 group"
                      variants={itemFadeIn}
                    >
                      <div className="flex-shrink-0 rounded-full bg-emerald-500/20 p-3 text-emerald-400 group-hover:bg-emerald-500/30 transition-colors">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-white text-lg mb-1">{feature.title}</h3>
                        <p className="text-slate-400">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="relative lg:col-span-7"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
              >
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/30 to-emerald-700/30 blur-lg opacity-60"></div>
                <div className="relative rounded-xl border border-slate-700/50 bg-slate-800 overflow-hidden shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                    alt="Analytics Dashboard"
                    width={640}
                    height={480}
                    className="w-full h-auto"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 -z-10" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(16,185,129,0.06),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4 text-white">Seamless Integrations</h2>
              <p className="text-lg text-slate-400">
                Connect with your favorite tools and services to streamline your workflow.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {[
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "Zapier",
                  description: "Connect with 3,000+ apps and automate your workflows.",
                },
                {
                  icon: <Laptop className="h-6 w-6" />,
                  title: "CMS Platforms",
                  description: "Integrate with WordPress, Ghost, Webflow, and more.",
                },
                {
                  icon: <Globe className="h-6 w-6" />,
                  title: "Social Media",
                  description: "Share your newsletters automatically on social platforms.",
                },
              ].map((integration, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-emerald-900/5 hover:border-emerald-500/30 transition-colors"
                  variants={itemFadeIn}
                  whileHover={{ y: -5 }}
                >
                  <div className="rounded-full bg-emerald-500/20 w-14 h-14 flex items-center justify-center mb-4 text-emerald-400">
                    {integration.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{integration.title}</h3>
                  <p className="text-slate-400">{integration.description}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="text-center mt-12"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="ghost"
                asChild
                className="border border-slate-700/50 bg-slate-800/40 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 hover:border-emerald-500/40 py-2 px-4 rounded-md backdrop-blur-sm"
              >
                <Link href="#all-integrations" className="flex items-center gap-2">
                  <span>View All Integrations</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(16,185,129,0.08),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4 text-white">More Powerful Features</h2>
              <p className="text-lg text-slate-400">
                Designed to help you at every stage of your newsletter journey.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {[
                {
                  icon: <Users className="h-6 w-6" />,
                  title: "Subscriber Management",
                  description:
                    "Easily manage your subscriber list with advanced filtering and organization tools.",
                },
                {
                  icon: <ShieldCheck className="h-6 w-6" />,
                  title: "Deliverability",
                  description:
                    "Ensure your newsletters reach the inbox with our deliverability optimization tools.",
                },
                {
                  icon: <LineChart className="h-6 w-6" />,
                  title: "Revenue Tools",
                  description:
                    "Monetize your newsletter with integrated subscription and sponsorship tools.",
                },
                {
                  icon: <Globe className="h-6 w-6" />,
                  title: "Custom Domains",
                  description: "Use your own domain for a professional and branded experience.",
                },
                {
                  icon: <Layout className="h-6 w-6" />,
                  title: "Landing Pages",
                  description:
                    "Create stunning landing pages to convert visitors into subscribers.",
                },
                {
                  icon: <Laptop className="h-6 w-6" />,
                  title: "Mobile Optimization",
                  description: "All newsletters are automatically optimized for mobile devices.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-emerald-900/5 hover:border-emerald-500/30 transition-all"
                  variants={itemFadeIn}
                  whileHover={{ y: -5 }}
                >
                  <div className="rounded-full bg-emerald-500/20 w-14 h-14 flex items-center justify-center mb-4 text-emerald-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,185,129,0.1),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="relative max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-emerald-600/20 rounded-xl blur-lg opacity-70"></div>
              <div className="relative rounded-xl border border-slate-700/50 bg-slate-800/90 backdrop-blur-sm p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                  Ready to Elevate Your Newsletter?
                </h2>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
                  Start your 14-day free trial today and experience all these powerful features.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      size="lg"
                      asChild
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-6 shadow-md shadow-emerald-500/20"
                    >
                      <Link href="/signup" className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Start Free Trial</span>
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button
                      variant="ghost"
                      size="lg"
                      asChild
                      className="border border-slate-700/50 bg-slate-800/50 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 hover:border-emerald-500/40 h-12 px-6 backdrop-blur-sm"
                    >
                      <Link href="/pricing" className="flex items-center gap-2">
                        <span>View Pricing</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
