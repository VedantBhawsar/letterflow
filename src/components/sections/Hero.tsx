"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Star, ChevronRight, MousePointer, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  const [isHovering, setIsHovering] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const controls = useAnimation();

  const features = [
    "Beautiful Templates",
    "Advanced Analytics",
    "Growth Tools",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-blue-50/50 -z-10" />

      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 left-1/3 w-2/3 h-1/3 bg-gradient-to-r from-primary/10 to-purple-200/20 blur-3xl rounded-full -z-10"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.7, 0.9, 0.7],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-0 right-1/3 w-1/2 h-1/2 bg-gradient-to-l from-blue-100/20 to-primary/5 blur-3xl rounded-full -z-10"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
            >
              <Star className="h-3.5 w-3.5 fill-primary" />
              <span>Fastest Growing App</span>
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Simply Elevate your Newsletter <br />
              <motion.span
                className="text-primary inline-block"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {features[currentFeature]}
              </motion.span>
              <br /> with Letterflow
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Boost your newsletter growth with powerful analytics, beautiful
              templates, and seamless integrations. Take your content to the
              next level with Letterflow.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  asChild
                  className="group relative overflow-hidden"
                >
                  <Link href="#contact" className="flex items-center gap-2">
                    Book a Call
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                    <span className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </Link>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button variant="outline" size="lg" asChild className="group">
                  <Link href="#features" className="flex items-center gap-2">
                    Learn More
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
          >
            <motion.div
              className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/30 to-purple-500/30 blur opacity-70"
              animate={isHovering ? { opacity: 1 } : { opacity: 0.7 }}
              transition={{ duration: 0.3 }}
            />

            <motion.div
              className="relative rounded-xl border border-border/40 bg-background/95 backdrop-blur shadow-xl overflow-hidden"
              animate={isHovering ? { y: -5 } : { y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1640552435388-a54879e72b28?q=80&w=2070&auto=format&fit=crop"
                alt="Letterflow Dashboard"
                width={720}
                height={480}
                className="rounded-xl w-full h-auto"
              />

              {/* Interactive cursor indicator */}
              <AnimatePresence>
                {isHovering && (
                  <motion.div
                    className="absolute cursor-pointer"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    style={{
                      top: "50%",
                      left: "50%",
                      x: "-50%",
                      y: "-50%",
                    }}
                  >
                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                      <MousePointer className="h-5 w-5 text-primary" />
                    </div>
                    <motion.div
                      className="absolute inset-0 border-2 border-primary rounded-lg"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              className="absolute -right-4 -bottom-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 border border-border"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex -space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-6 w-6 rounded-full border-2 border-white"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    style={{
                      backgroundImage: `url(https://randomuser.me/api/portraits/men/${
                        i + 20
                      }.jpg)`,
                      backgroundSize: "cover",
                    }}
                  />
                ))}
              </div>
              <div className="text-xs font-medium">
                <div className="flex items-center">
                  4.9/5 rating
                  <div className="flex ml-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 + i * 0.1 }}
                      >
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                </div>
                <motion.div
                  className="text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  from 2,000+ users
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
