"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
  TrendingUp,
  LayoutTemplate, // Added for template preview
} from "lucide-react";
import Image from "next/image";

export default function Hero() {
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const benefits = ["Design Stunning Emails", "Understand Your Audience", "Automate Your Growth"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [benefits.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95, x: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-blue-50/30 to-background pt-8 pb-20  md:pb-28">
      {/* ... (background shapes remain the same) ... */}
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-full opacity-30 bg-gradient-to-br from-primary/5 via-transparent to-transparent -z-10"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 0.3, x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-1/3 h-1/2 opacity-20 bg-gradient-to-tl from-blue-200/10 via-transparent to-transparent rounded-full blur-3xl -z-10"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 0.2, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
      />

      <div className="container mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Text Content Area */}
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            {/* ... (rest of the text content remains the same) ... */}
            <motion.div variants={itemVariants}>
              <Link href="#pricing" className="inline-block group">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary transition-colors group-hover:bg-primary/20">
                  <Zap className="h-4 w-4" />
                  <span>New: AI Subject Line Generator</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-tight md:leading-tight"
            >
              Grow Your Newsletter Smarter, <br className="hidden md:inline" />
              Not Harder with Letterflow
            </motion.h1>

            {/* Animated Benefit Text */}
            <motion.div variants={itemVariants} className="h-7 md:h-8 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentBenefit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="block text-xl md:text-2xl font-medium text-primary"
                >
                  {benefits[currentBenefit]}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <motion.p
              variants={itemVariants}
              className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0"
            >
              Letterflow provides the tools, analytics, and templates you need to create engaging
              newsletters and accelerate your audience growth.
            </motion.p>

            {/* Call to Actions */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            >
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button size="lg" asChild className="w-full sm:w-auto shadow-lg shadow-primary/30">
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
                  <Link href="#features">Explore Features</Link>
                </Button>
              </motion.div>
            </motion.div>

            {/* Social Proof / Trust Signals */}
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-center lg:justify-start gap-4 pt-4 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">4.9/5</span>
                <span>Rating</span>
              </div>
              <span className="text-border">|</span>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="font-medium">10k+</span>
                <span>Happy Users</span>
              </div>
            </motion.div>
          </div>

          {/* Visual Content Area */}
          <motion.div
            variants={imageVariants} // Use imageVariants here for initial animation
            className="relative mx-auto lg:mx-0" // Removed whileHover from main container to allow hover on individual elements
          >
            {/* Optional subtle glow effect */}
            <div className="absolute -inset-2 md:-inset-4 rounded-2xl bg-gradient-to-r from-primary/10 via-blue-200/10 to-primary/10 opacity-50 blur-xl transition-opacity duration-300 group-hover:opacity-75 -z-10" />

            <div className="relative rounded-xl border border-border/20 bg-background/80 backdrop-blur-sm shadow-2xl shadow-primary/10 overflow-hidden aspect-[16/10] md:aspect-[5/3] group">
              {" "}
              {/* Added group class */}
              <Image
                src="/image.png" // *** IMPORTANT: Replace this with your actual image path ***
                alt="Letterflow Application Interface"
                layout="fill"
                objectFit="cover"
                className="rounded-xl transition-transform duration-500 group-hover:scale-[1.05] group-hover:rotate-1" // Apply scale on hover to the image via group
                priority
              />
              {/* ------- Floating UI Element 1: Growth Rate (Existing - Option 3 from previous) ------- */}
              <motion.div
                className="absolute top-6 -left-4 w-36 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg shadow-black/15 p-3 border border-border/15 hidden md:block overflow-hidden"
                initial={{ opacity: 0, y: -15, rotate: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, rotate: -5, scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 150, damping: 20 }}
                whileHover={{ scale: 1.05, y: -3, shadow: "xl" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">
                      Growth
                    </p>
                    <p className="text-sm font-bold text-foreground">+15.2%</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                </div>
                <div className="mt-2 h-4 w-full opacity-70">
                  <svg width="100%" height="100%" viewBox="0 0 100 16" preserveAspectRatio="none">
                    <polyline
                      points="0,12 10,10 20,13 30,9 40,11 50,8 60,10 70,6 80,9 90,5 100,7"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.div>
              {/* ------- Floating UI Element 2: Campaign Sent (Existing) ------- */}
              <motion.div
                className="absolute bottom-8 -right-6 w-44 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg shadow-black/15 p-3 border border-border/15 hidden md:block overflow-hidden" // Adjusted styling consistency
                initial={{ opacity: 0, x: 20, rotate: 3, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, rotate: 3, scale: 1 }} // Animate to x: 0
                transition={{ delay: 1.0, type: "spring", stiffness: 150, damping: 20 }}
                whileHover={{ scale: 1.05, y: -3, shadow: "xl", rotate: 2 }} // Added rotate on hover
              >
                <p className="text-xs font-semibold mb-1 flex items-center gap-1.5 text-foreground">
                  {" "}
                  {/* Semibold and gap */}
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" /> Campaign Sent
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {" "}
                  {/* Smaller text, tighter leading */}
                  Weekly Digest -{" "}
                  <span className="font-medium text-foreground/80">85% Open Rate</span>
                </p>
              </motion.div>
              {/* ------- Floating UI Element 3: Subscriber Count (NEW) ------- */}
              <motion.div
                className="absolute top-1/3 -right-5 transform translate-y-[-50%] w-auto bg-background/90 backdrop-blur-sm rounded-full shadow-md shadow-black/10 px-3 py-1.5 border border-border/10 hidden md:flex items-center gap-2" // Pill shape, top-rightish
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1, rotate: 15 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 180, damping: 15 }}
                whileHover={{ scale: 1.1, shadow: "lg" }}
              >
                <Users className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-foreground">12,480</span>
                <span className="text-xs text-muted-foreground font-medium">Subs</span>
              </motion.div>
              {/* ------- Floating UI Element 4: Template Preview (NEW) ------- */}
              <motion.div
                className="absolute bottom-6 -left-5 w-24 h-16 bg-gradient-to-br from-green-100 via-white to-blue-100 rounded-lg shadow-md shadow-black/10 p-2 border border-border/10 hidden md:block overflow-hidden" // Smaller preview card
                initial={{ opacity: 0, y: 20, rotate: 5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, rotate: 5, scale: 1 }}
                transition={{ delay: 1.4, type: "spring", stiffness: 180, damping: 15 }}
                whileHover={{ scale: 1.08, y: -3, shadow: "lg", rotate: 3 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[9px] font-medium text-green-700 uppercase tracking-wide">
                    Template
                  </p>
                  <LayoutTemplate className="h-3 w-3 text-green-500 opacity-70" />
                </div>
                {/* Simple visual representation */}
                <div className="space-y-1">
                  <div className="h-1 w-3/4 bg-green-300 rounded-full"></div>
                  <div className="h-1 w-full bg-green-200 rounded-full"></div>
                  <div className="h-1 w-1/2 bg-green-300 rounded-full"></div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
