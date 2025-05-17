"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Link2, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

const integrationLogos = [
  {
    name: "Mailchimp",
    logo: "/integrations/mailchimp.svg",
    color: "#FFE01B",
  },
  {
    name: "Zapier",
    logo: "/integrations/zapier.svg",
    color: "#FF4A00",
  },
  {
    name: "Stripe",
    logo: "/integrations/stripe.svg",
    color: "#635BFF",
  },
  {
    name: "Slack",
    logo: "/integrations/slack.svg",
    color: "#4A154B",
  },
  {
    name: "Google",
    logo: "/integrations/google.svg",
    color: "#4285F4",
  },
  {
    name: "HubSpot",
    logo: "/integrations/hubspot.svg",
    color: "#FF7A59",
  },
  {
    name: "WordPress",
    logo: "/integrations/wordpress.svg",
    color: "#21759B",
  },
  {
    name: "Salesforce",
    logo: "/integrations/salesforce.svg",
    color: "#00A1E0",
  },
  {
    name: "Notion",
    logo: "/integrations/notion.svg",
    color: "#000000",
  },
  {
    name: "Microsoft",
    logo: "/integrations/microsoft.svg",
    color: "#00A4EF",
  },
];

// For demo purposes, we'll display colored blocks until actual logos are available
const LogoPlaceholder = ({ name, color }: { name: string; color: string }) => (
  <div
    className="w-full h-full flex items-center justify-center rounded-full"
    style={{ backgroundColor: `${color}30` }}
  >
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
      style={{ backgroundColor: color }}
    >
      {name.charAt(0)}
    </div>
  </div>
);

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: index * 0.05,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
  hover: {
    y: -8,
    scale: 1.05,
    boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.3)",
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export default function Integrations() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setScrollPosition(scrollLeft);
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Handle showing placeholders for missing image files
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setFailedImages((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  return (
    <section
      id="integrations"
      className="relative py-24 bg-gradient-to-b from-slate-950 to-slate-900 text-white overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="absolute top-20 right-40 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-40 left-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>

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
            <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent text-sm font-medium tracking-wider uppercase flex items-center gap-2">
              <Link2 className="h-4 w-4 text-emerald-400" />
              Powerful Integrations
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Connect, Sync, and Automate
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Enhance your capabilities by integrating Letterflow with the tools you already use
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto mb-16">
          {/* Navigation arrows */}
          <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 z-10 md:block hidden">
            <motion.button
              className={`bg-slate-800/80 backdrop-blur-sm rounded-full p-3 shadow-lg border border-slate-700 text-slate-400 ${
                showLeftArrow
                  ? "hover:text-emerald-400 hover:border-emerald-500/50"
                  : "opacity-40 cursor-not-allowed"
              }`}
              onClick={scrollLeft}
              disabled={!showLeftArrow}
              initial={{ opacity: 0 }}
              animate={{ opacity: showLeftArrow ? 1 : 0.4 }}
              whileHover={showLeftArrow ? { scale: 1.1 } : {}}
              whileTap={showLeftArrow ? { scale: 0.95 } : {}}
            >
              <ChevronLeft size={22} />
            </motion.button>
          </div>

          <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 z-10 md:block hidden">
            <motion.button
              className={`bg-slate-800/80 backdrop-blur-sm rounded-full p-3 shadow-lg border border-slate-700 text-slate-400 ${
                showRightArrow
                  ? "hover:text-emerald-400 hover:border-emerald-500/50"
                  : "opacity-40 cursor-not-allowed"
              }`}
              onClick={scrollRight}
              disabled={!showRightArrow}
              initial={{ opacity: 0 }}
              animate={{ opacity: showRightArrow ? 1 : 0.4 }}
              whileHover={showRightArrow ? { scale: 1.1 } : {}}
              whileTap={showRightArrow ? { scale: 0.95 } : {}}
            >
              <ChevronRight size={22} />
            </motion.button>
          </div>

          {/* Integration logos container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-8 py-6 px-2 overflow-x-auto scrollbar-hide"
            onScroll={handleScroll}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {integrationLogos.map((integration, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-24 h-24 bg-slate-800/70 backdrop-blur-sm rounded-full border border-slate-700 shadow-lg flex items-center justify-center cursor-pointer"
                custom={index}
                variants={logoVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
              >
                {!failedImages[index] ? (
                  <Image
                    src={integration.logo || "/integrations/placeholder.svg"}
                    alt={integration.name}
                    width={48}
                    height={48}
                    onError={() => handleImageError(index)}
                    className="rounded-full"
                  />
                ) : (
                  <LogoPlaceholder name={integration.name} color={integration.color} />
                )}
                <span className="sr-only">{integration.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Mobile navigation dots */}
          <div className="flex justify-center mt-8 space-x-2 md:hidden">
            {Array.from({
              length: Math.ceil(integrationLogos.length / 3),
            }).map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  scrollPosition > index * 300 && scrollPosition < (index + 1) * 300
                    ? "w-8 bg-emerald-500"
                    : "w-2 bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Button
            size="lg"
            className="bg-slate-800 hover:bg-slate-700 text-white shadow-lg border border-slate-700 hover:border-emerald-500/30 group"
            asChild
          >
            <Link href="/integrations" className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              View all integrations
              <ChevronRight className="h-4 w-4 text-emerald-400 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
