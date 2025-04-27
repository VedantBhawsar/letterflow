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
} from "lucide-react";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

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
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-slate-100/50 -z-10" />
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-blue-50/50 -z-10" />
          <div className="absolute top-0 left-1/3 w-2/3 h-1/3 bg-gradient-to-r from-primary/10 to-purple-200/20 blur-3xl rounded-full -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-16"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Powerful Features for Newsletter Creators
              </h1>
              <p className="text-xl text-muted-foreground">
                Everything you need to create, grow, and monetize your newsletter in one platform.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Email Builder Features */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-[#134e4a] to-[#0d3330] -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_60%,rgba(16,185,129,0.1),transparent)] -z-10" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4 text-white">Email Builder</h2>
              <p className="text-lg text-white/70">
                Create beautiful newsletters without writing a single line of code.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                className="order-2 lg:order-1 relative"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
              >
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/50 to-teal-700/50 blur-lg opacity-70"></div>
                <div className="relative rounded-xl border border-white/10 bg-[#0f3f3d] overflow-hidden shadow-xl">
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
                className="order-1 lg:order-2 space-y-8"
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
                  ].map((feature: any, index: any) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4"
                      variants={itemFadeIn}
                    >
                      <div className="flex-shrink-0 rounded-full bg-primary/20 p-2 text-primary">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{feature.title}</h3>
                        <p className="text-white/70">{feature.description}</p>
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
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-blue-50/20 -z-10" />
          <div className="absolute inset-y-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/40 to-transparent -z-10" />
          <div className="absolute top-1/4 left-0 w-1/3 h-1/2 bg-gradient-to-r from-primary/5 to-transparent -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4">Analytics & Insights</h2>
              <p className="text-lg text-muted-foreground">
                Understand your audience and optimize your content with detailed analytics.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                className="space-y-8"
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
                  ].map((feature: any, index: any) => (
                    <motion.div
                      key={index}
                      className="flex items-start gap-4"
                      variants={itemFadeIn}
                    >
                      <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 text-primary">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
              >
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-primary/20 blur-lg opacity-70"></div>
                <div className="relative rounded-xl border border-border/40 overflow-hidden shadow-xl">
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
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 to-white -z-10" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,rgba(16,185,129,0.04),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4">Seamless Integrations</h2>
              <p className="text-lg text-muted-foreground">
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
              ].map((integration: any, index: any) => (
                <motion.div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-border/60 shadow-sm"
                  variants={itemFadeIn}
                  whileHover={{ y: -5 }}
                >
                  <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4 text-primary">
                    {integration.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{integration.title}</h3>
                  <p className="text-muted-foreground">{integration.description}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div className="text-center mt-12" whileHover={{ scale: 1.05 }}>
              <Button variant="outline" asChild>
                <Link href="#all-integrations">View All Integrations</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/30 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(16,185,129,0.05),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4">More Powerful Features</h2>
              <p className="text-lg text-muted-foreground">
                Designed to help you at every stage of your newsletter journey.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
              ].map((feature: any, index: any) => (
                <motion.div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-border/60 shadow-sm"
                  variants={itemFadeIn}
                  whileHover={{ y: -5 }}
                >
                  <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-white -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,185,129,0.08),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="relative max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 via-primary/20 to-purple-100 rounded-xl blur-md opacity-50"></div>
              <div className="relative rounded-xl border border-border/40 bg-white/80 backdrop-blur-sm p-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to Elevate Your Newsletter?
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                  Start your 14-day free trial today and experience all these powerful features.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button size="lg" asChild>
                      <Link href="/signup">Start Free Trial</Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button variant="outline" size="lg" asChild>
                      <Link href="/pricing">View Pricing</Link>
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
