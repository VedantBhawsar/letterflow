"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
  Gift,
  Code,
  Mail,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const [currentBenefit, setCurrentBenefit] = useState(0);
  const benefits = [
    "Create Stunning Newsletters",
    "Grow Your Audience Faster",
    "Get Actionable Analytics",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [benefits.length]);

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 bg-slate-900 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="h-full w-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-1/3 h-1/3 bg-gradient-to-b from-emerald-500/20 via-transparent to-transparent rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Product of the day badge */}
      <div className="hidden container mx-auto px-4 mb-6 sm:mb-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-center lg:justify-start gap-2">
            <div className="relative inline-flex">
              <div className="flex items-center">
                {/* <div className="text-emerald-500 text-xs sm:text-sm font-medium border border-emerald-500/30 rounded-full px-2 sm:px-3 py-1 bg-emerald-500/10">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>Product of the day</span>
                  </div>
                </div> */}
              </div>

              <div className="absolute -left-5 sm:-left-7 -right-5 sm:-right-7 -top-5 sm:-top-6 -bottom-5 sm:-bottom-6 flex justify-between pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 100 100"
                  className="text-emerald-500/20"
                >
                  <path
                    d="M95.8,30c-2.6-0.8-5.2-1.2-7.8-1.2c-7.4,0-14.5,3-19.6,8.1L50,55.3L31.6,36.9c-5.1-5.1-12.2-8.1-19.6-8.1
                    c-2.6,0-5.2,0.4-7.8,1.2C0.8,31.5-0.8,36.5,0.3,41.6c0.4,1.7,1.2,3.3,2.3,4.7L50,94.8l47.3-48.4c1.1-1.4,1.9-3,2.3-4.7
                    C100.8,36.5,99.2,31.5,95.8,30z"
                    fill="currentColor"
                  ></path>
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 100 100"
                  className="text-emerald-500/20"
                >
                  <path
                    d="M95.8,30c-2.6-0.8-5.2-1.2-7.8-1.2c-7.4,0-14.5,3-19.6,8.1L50,55.3L31.6,36.9c-5.1-5.1-12.2-8.1-19.6-8.1
                    c-2.6,0-5.2,0.4-7.8,1.2C0.8,31.5-0.8,36.5,0.3,41.6c0.4,1.7,1.2,3.3,2.3,4.7L50,94.8l47.3-48.4c1.1-1.4,1.9-3,2.3-4.7
                    C100.8,36.5,99.2,31.5,95.8,30z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
            </div>
            <div className="text-base sm:text-lg font-bold text-emerald-500">2nd</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left column - Text content */}
            <div className="space-y-8 sm:space-y-10 text-center lg:text-left lg:col-span-5 relative">
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="block">Ship your newsletter</span>
                <span className="block mt-1">
                  in days,{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-emerald-400">not weeks</span>
                    <span className="absolute inset-0 bg-emerald-500/10 -skew-y-2 rounded-md" />
                  </span>
                </span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                The all-in-one platform to create, send, and analyze newsletters that convert. Grow
                your audience and monetize your content with Letterflow.
              </motion.p>

              {/* Feature highlights */}
              <motion.div
                className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {[
                  { icon: <Mail className="h-4 w-4" />, text: "Beautiful Templates" },
                  { icon: <Users className="h-4 w-4" />, text: "Subscriber Management" },
                  { icon: <CheckCircle className="h-4 w-4" />, text: "Analytics Dashboard" },
                  { icon: <Code className="h-4 w-4" />, text: "API Integration" },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-6 sm:w-7 h-6 sm:h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      {feature.icon}
                    </div>
                    <span className="text-xs sm:text-sm text-slate-300">{feature.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start relative z-20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link href="/signup">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 rounded-md text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 shadow-md shadow-emerald-500/20 w-full sm:w-auto">
                    <Zap className="h-4 w-4" />
                    <span>Get Started Free</span>
                  </Button>
                </Link>

                <Link href="/demo">
                  <Button
                    variant="outline"
                    className="bg-white text-emerald-600 border-white hover:bg-slate-100 hover:text-emerald-700 hover:border-slate-100 flex items-center gap-2 rounded-md text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
                  >
                    <span>View Demo</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Discount offer */}
              <motion.div
                className="flex items-center justify-center lg:justify-start gap-2 text-slate-300 bg-slate-800/50 rounded-lg p-2 sm:p-3 border border-slate-700/50 max-w-md mx-auto lg:mx-0 text-xs sm:text-sm relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Gift className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">$100 off</span>
                <span>for the first 7060 customers (15 left)</span>
              </motion.div>

              {/* Social Proof */}
              <motion.div
                className="hidden sm:block relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-6 sm:w-8 h-6 sm:h-8 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800"
                      >
                        <Image
                          src={`https://i.pravatar.cc/100?img=${i + 10}`}
                          alt="Avatar"
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5 sm:gap-1 text-emerald-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-3 sm:h-4 w-3 sm:w-4 fill-emerald-500" />
                    ))}
                  </div>
                  <span className="text-slate-300 text-xs sm:text-sm">7045 makers ship faster</span>
                </div>
              </motion.div>
            </div>

            {/* Right column - Visual content */}
            <motion.div
              className="relative lg:col-span-7 mt-4 lg:mt-0 z-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-2xl shadow-emerald-500/5">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-slate-900 to-slate-900"></div>

                {/* Feature diagram */}
                <div className="relative z-0 p-4 sm:p-6">
                  <div className="aspect-[16/9] bg-slate-950/50 backdrop-blur-sm rounded-lg overflow-hidden border border-slate-800">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[90%] h-[90%] relative">
                        {/* Central logo */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                          <div className="w-20 h-20 sm:w-24 md:w-32 sm:h-24 md:h-32 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="40"
                              height="40"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="sm:w-[48px] sm:h-[48px] md:w-[64px] md:h-[64px]"
                            >
                              <path d="M6.8 22 12 19l5.2 3V7.8l-5.2-3-5.2 3Z" />
                              <path d="m19 7.8 2-1.2V18l-2.2 1.2" />
                              <path d="M5 7.8 3 6.6V18l2 1.2" />
                              <path d="m12 10.5-5-3" />
                              <path d="m17 7.5-5 3" />
                              <path d="M12 13v6" />
                            </svg>
                          </div>
                          <span className="text-sm sm:text-base font-medium text-slate-300">
                            Letterflow
                          </span>
                        </div>

                        {/* Surrounding features - Only shown on larger screens */}
                        <div className="hidden sm:block absolute top-0 left-1/4 transform -translate-x-1/2 bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700 shadow-lg shadow-emerald-500/5">
                          <div className="flex flex-col items-center gap-2">
                            <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                            <span className="text-xs sm:text-sm text-slate-300">Email Builder</span>
                          </div>
                        </div>

                        <div className="hidden sm:block absolute bottom-0 right-1/4 transform translate-x-1/2 bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700 shadow-lg shadow-emerald-500/5">
                          <div className="flex flex-col items-center gap-2">
                            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                            <span className="text-xs sm:text-sm text-slate-300">Subscribers</span>
                          </div>
                        </div>

                        <div className="hidden md:block absolute top-1/3 right-0 bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700 shadow-lg shadow-emerald-500/5">
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                            <span className="text-xs sm:text-sm text-slate-300">Analytics</span>
                          </div>
                        </div>

                        <div className="hidden md:block absolute bottom-1/4 left-0 bg-slate-800 rounded-lg p-3 sm:p-4 border border-slate-700 shadow-lg shadow-emerald-500/5">
                          <div className="flex flex-col items-center gap-2">
                            <Code className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                            <span className="text-xs sm:text-sm text-slate-300">Integrations</span>
                          </div>
                        </div>

                        {/* Connection lines - Only on larger screens */}
                        <svg
                          className="absolute inset-0 w-full h-full hidden sm:block pointer-events-none"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M50,50 L25,25"
                            stroke="currentColor"
                            strokeWidth="0.8"
                            className="text-emerald-500/30"
                          />
                          <path
                            d="M50,50 L75,25"
                            stroke="currentColor"
                            strokeWidth="0.8"
                            className="text-emerald-500/30"
                          />
                          <path
                            d="M50,50 L75,75"
                            stroke="currentColor"
                            strokeWidth="0.8"
                            className="text-emerald-500/30"
                          />
                          <path
                            d="M50,50 L25,75"
                            stroke="currentColor"
                            strokeWidth="0.8"
                            className="text-emerald-500/30"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Command - Hidden on small screens */}
                <div className="absolute bottom-4 right-4 hidden sm:block bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg">
                  <code className="text-emerald-400 font-mono text-xs sm:text-sm">
                    npm install letterflow
                  </code>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
