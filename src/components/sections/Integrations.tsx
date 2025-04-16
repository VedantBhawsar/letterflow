"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
    style={{ backgroundColor: `${color}15` }}
  >
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
      style={{ backgroundColor: color }}
    >
      {name.charAt(0)}
    </div>
  </div>
);

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
    <section id="integrations" className="relative py-20">
      <div className="absolute inset-0 bg-white -z-10" />
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(16,185,129,0.05),transparent)] -z-10" />

      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Connect, Sync, and Automate</h2>
          <p className="text-lg text-gray-600">
            Enhance your capabilities by integrating Letterflow with the tools you already use
          </p>
        </motion.div>

        <div className="relative max-w-5xl mx-auto mb-12">
          {/* Navigation arrows */}
          <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 z-10">
            <motion.button
              className={`bg-white rounded-full p-2 shadow-md border border-gray-100 text-gray-400 ${
                showLeftArrow ? "hover:text-primary" : "opacity-40 cursor-not-allowed"
              }`}
              onClick={scrollLeft}
              disabled={!showLeftArrow}
              initial={{ opacity: 0 }}
              animate={{ opacity: showLeftArrow ? 1 : 0.4 }}
              whileHover={showLeftArrow ? { scale: 1.1 } : {}}
              whileTap={showLeftArrow ? { scale: 0.95 } : {}}
            >
              <ChevronLeft size={20} />
            </motion.button>
          </div>

          <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 z-10">
            <motion.button
              className={`bg-white rounded-full p-2 shadow-md border border-gray-100 text-gray-400 ${
                showRightArrow ? "hover:text-primary" : "opacity-40 cursor-not-allowed"
              }`}
              onClick={scrollRight}
              disabled={!showRightArrow}
              initial={{ opacity: 0 }}
              animate={{ opacity: showRightArrow ? 1 : 0.4 }}
              whileHover={showRightArrow ? { scale: 1.1 } : {}}
              whileTap={showRightArrow ? { scale: 0.95 } : {}}
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>

          {/* Integration logos container */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-8 py-4 px-2 overflow-x-auto scrollbar-hide"
            onScroll={handleScroll}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {integrationLogos.map((integration, index) => (
              <motion.div
                key={index}
                className="flex-shrink-0 w-20 h-20 bg-white rounded-full border border-gray-100 shadow-sm flex items-center justify-center"
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.05 },
                }}
                viewport={{ once: true }}
              >
                {!failedImages[index] ? (
                  <Image
                    src={integration.logo || "/integrations/placeholder.svg"}
                    alt={integration.name}
                    width={40}
                    height={40}
                    onError={() => handleImageError(index)}
                  />
                ) : (
                  <LogoPlaceholder name={integration.name} color={integration.color} />
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress indicator */}
          <div className="hidden md:flex justify-center mt-4 space-x-1.5">
            {integrationLogos.length > 0 &&
              Array.from({
                length: Math.ceil(integrationLogos.length / 4),
              }).map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    scrollPosition > index * 300 && scrollPosition < (index + 1) * 300
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-gray-200"
                  }`}
                />
              ))}
          </div>
        </div>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="outline"
            size="lg"
            asChild
            className="group border-primary/20 text-primary hover:bg-primary/5"
          >
            <Link href="/integrations" className="flex items-center gap-2">
              View all integrations
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
