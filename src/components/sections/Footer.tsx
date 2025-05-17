"use client";

import Link from "next/link";
import {
  Mail,
  Twitter,
  Github,
  Instagram,
  Linkedin,
  ExternalLink,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Templates", href: "/templates" },
        { label: "Integrations", href: "/integrations" },
        { label: "API", href: "/api-docs" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Documentation", href: "/docs" },
        { label: "Guides", href: "/guides" },
        { label: "Tutorials", href: "/tutorials" },
        { label: "Webinars", href: "/webinars" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" },
        { label: "Testimonials", href: "/testimonials" },
        { label: "Partners", href: "/partners" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Security", href: "/security" },
        { label: "Accessibility", href: "/accessibility" },
        { label: "Cookies", href: "/cookies" },
      ],
    },
  ];

  const socialLinks = [
    {
      icon: <Twitter className="h-5 w-5" />,
      href: "https://twitter.com/letterflow",
      label: "Twitter",
      color: "#1DA1F2",
    },
    {
      icon: <Instagram className="h-5 w-5" />,
      href: "https://instagram.com/letterflow",
      label: "Instagram",
      color: "#E1306C",
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      href: "https://linkedin.com/company/letterflow",
      label: "LinkedIn",
      color: "#0A66C2",
    },
    {
      icon: <Github className="h-5 w-5" />,
      href: "https://github.com/letterflow",
      label: "GitHub",
      color: "#24292e",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
      },
    },
    hover: {
      x: 3,
      color: "#10B981",
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
      <div className="absolute top-40 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>

      <div className="container mx-auto px-4 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 gap-16 xl:grid-cols-12">
          {/* Logo and company info */}
          <motion.div
            className="col-span-1 xl:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500 group-hover:text-emerald-400 transition-colors duration-200"
              >
                <path d="M6.8 22 12 19l5.2 3V7.8l-5.2-3-5.2 3Z" />
                <path d="m19 7.8 2-1.2V18l-2.2 1.2" />
                <path d="M5 7.8 3 6.6V18l2 1.2" />
                <path d="m12 10.5-5-3" />
                <path d="m17 7.5-5 3" />
                <path d="M12 13v6" />
              </svg>
              <span className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-200">
                Letterflow
              </span>
            </Link>

            <motion.p
              className="text-slate-300 mb-8 max-w-md leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Letterflow is the all-in-one platform for newsletter creators to design, send, and
              analyze their newsletters with powerful tools and actionable insights.
            </motion.p>

            <motion.div
              className="mb-8 bg-slate-800/50 p-5 rounded-xl border border-slate-700 backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-emerald-400" />
                Subscribe to our updates
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Email address"
                  className="bg-slate-900/80 border-slate-700 focus-visible:ring-emerald-500 focus-visible:border-emerald-500/50 text-white placeholder:text-slate-500"
                />
                <Button
                  variant="default"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0 shadow-lg hover:shadow-emerald-500/20 transition-all"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-800/80 text-slate-400 backdrop-blur-sm border border-slate-700/50 shadow-lg hover:text-white hover:border-slate-600 transition-all duration-200"
                  aria-label={social.label}
                  whileHover={{
                    y: -5,
                    backgroundColor: `${social.color}30`,
                    borderColor: `${social.color}50`,
                    color: social.color,
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Navigation links */}
          <div className="col-span-1 xl:col-span-8">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {footerSections.map((section, index) => (
                <motion.div key={index} variants={itemVariants} custom={index}>
                  <h3 className="font-semibold text-white mb-5 text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent pb-1 border-b border-slate-800">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <motion.li
                        key={linkIndex}
                        variants={linkVariants}
                        custom={linkIndex}
                        whileHover="hover"
                      >
                        <Link
                          href={link.href}
                          className="text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 group"
                        >
                          <span>{link.label}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom section */}
        <motion.div
          className="mt-16 pt-6 border-t border-slate-800"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} Letterflow. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/terms"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
