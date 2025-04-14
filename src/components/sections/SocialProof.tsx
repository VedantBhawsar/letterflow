"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const companies = [
  {
    name: "Acme Inc.",
    logo: "👾",
    industry: "Technology",
    quote:
      "Letterflow transformed our newsletter strategy and increased our open rates by 35%.",
    author: "John Smith, Marketing Director",
  },
  {
    name: "Globex",
    logo: "🚀",
    industry: "Aerospace",
    quote:
      "The analytics provided by Letterflow gave us insights we never knew we needed.",
    author: "Maria Chen, CEO",
  },
  {
    name: "Initech",
    logo: "💻",
    industry: "Software",
    quote:
      "We've doubled our subscriber base in just 3 months using Letterflow's growth tools.",
    author: "Peter Gibbons, CTO",
  },
  {
    name: "Umbrella Corp",
    logo: "☂️",
    industry: "Healthcare",
    quote:
      "Letterflow has been vital in communicating complex information to our stakeholders.",
    author: "Alice Wong, Communications Lead",
  },
  {
    name: "Stark Industries",
    logo: "⚡",
    industry: "Energy",
    quote:
      "The email builder is so intuitive that our team was able to create stunning newsletters from day one.",
    author: "Tony Stark, Founder",
  },
  {
    name: "Wayne Enterprises",
    logo: "🦇",
    industry: "Finance",
    quote:
      "Letterflow's segmentation features helped us deliver more personalized content to our customers.",
    author: "Bruce Wayne, CEO",
  },
  {
    name: "Cyberdyne Systems",
    logo: "🤖",
    industry: "Robotics",
    quote:
      "Our newsletter engagement increased by 40% after switching to Letterflow.",
    author: "Sarah Connor, Product Manager",
  },
  {
    name: "Oscorp",
    logo: "🧪",
    industry: "Biotechnology",
    quote:
      "The ease of use and powerful automation features make Letterflow stand out from competitors.",
    author: "Norman Osborn, Research Director",
  },
];

// Get unique industries for filter
const industries = Array.from(
  new Set(companies.map((company) => company.industry))
);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export default function SocialProof() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [spotlight, setSpotlight] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [currentHighlight, setCurrentHighlight] = useState<number | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [spotlightIntensity, setSpotlightIntensity] = useState(50);

  // Filter companies based on selected industry and search query
  const filteredCompanies = companies.filter((company) => {
    const matchesIndustry = selectedIndustry
      ? company.industry === selectedIndustry
      : true;
    const matchesSearch = searchQuery
      ? company.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesIndustry && matchesSearch;
  });

  // Auto-rotate through companies
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setCurrentHighlight((prev) => {
        if (prev === null) return 0;
        return (prev + 1) % filteredCompanies.length;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRotate, filteredCompanies.length]);

  // Stop auto-rotate when user hovers
  useEffect(() => {
    if (hoveredIndex !== null) {
      setAutoRotate(false);
      setCurrentHighlight(null);
    } else {
      setAutoRotate(true);
    }
  }, [hoveredIndex]);

  return (
    <section className="py-16 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 -z-10"
        onClick={() => setSpotlight(!spotlight)}
      />

      {/* Animated background elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute h-64 w-64 rounded-full bg-primary/5 -top-20 -left-20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute h-96 w-96 rounded-full bg-blue-500/5 -bottom-40 -right-20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2
            className="text-2xl md:text-3xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600"
            whileInView={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            Trusted by Industry Leaders
          </motion.h2>
          <motion.p
            className="text-gray-600 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join the growing list of companies using Letterflow to boost
            engagement and grow their audience.
          </motion.p>
        </motion.div>

        {/* Search and filter controls */}
        <motion.div
          className="mb-8 flex flex-col md:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search companies..."
              className="w-full px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-3 top-2.5 text-gray-400">🔍</div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-2 px-1">
            <button
              className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-full transition-colors ${
                selectedIndustry === null
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
              onClick={() => setSelectedIndustry(null)}
            >
              All Industries
            </button>
            {industries.map((industry) => (
              <button
                key={industry}
                className={`whitespace-nowrap px-3 py-1.5 text-sm rounded-full transition-colors ${
                  selectedIndustry === industry
                    ? "bg-primary text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                onClick={() => setSelectedIndustry(industry)}
              >
                {industry}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Spotlight controls when spotlight is enabled */}
        <AnimatePresence>
          {spotlight && (
            <motion.div
              className="mb-8 max-w-md mx-auto bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200 shadow-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-sm text-gray-600 mb-2">Spotlight Intensity</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">Low</span>
                <input
                  type="range"
                  min="20"
                  max="90"
                  value={spotlightIntensity}
                  onChange={(e) =>
                    setSpotlightIntensity(parseInt(e.target.value))
                  }
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500">High</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className={`relative flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-300 ${
                  spotlight &&
                  (hoveredIndex === index || currentHighlight === index)
                    ? "bg-white shadow-lg z-10 scale-110"
                    : spotlight
                    ? `opacity-${100 - spotlightIntensity}`
                    : "hover:bg-white hover:shadow-md"
                }`}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                whileHover={{ scale: 1.05 }}
                animate={
                  currentHighlight === index && spotlight
                    ? {
                        scale: [1, 1.05, 1],
                        transition: { duration: 1 },
                      }
                    : {}
                }
              >
                <motion.div
                  className="text-4xl md:text-5xl mb-3"
                  whileHover={{
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.5 },
                  }}
                >
                  {company.logo}
                </motion.div>

                <h3 className="font-medium text-gray-900">{company.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{company.industry}</p>

                {/* Appear when hovered */}
              </motion.div>
            ))
          ) : (
            <motion.div
              className="col-span-full text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-500">
                No companies found matching your criteria.
              </p>
              <button
                className="mt-4 text-primary hover:underline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedIndustry(null);
                }}
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            className="text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-full px-6 py-2 text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSpotlight(!spotlight)}
          >
            {spotlight ? "Disable Spotlight" : "Enable Spotlight"}
          </motion.button>

          <motion.div
            className="mt-4 text-xs text-gray-500"
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {spotlight
              ? "Click on companies to see their testimonials"
              : "Enable spotlight mode for an interactive experience"}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
