"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowRight, CheckCircle, Mail, Sparkles, Zap, Gift } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Cta() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulating form submission
    setTimeout(() => {
      setSubmitted(true);
    }, 800);
  };

  const features = [
    "No credit card required",
    "Free plan available",
    "Cancel anytime",
    "14-day trial on all plans",
  ];

  return (
    <section className="py-24 md:py-32 relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -right-[30%] w-[80%] h-[80%] bg-emerald-500/10 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-[40%] -left-[30%] w-[80%] h-[80%] bg-emerald-500/10 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="relative max-w-5xl mx-auto">
          {/* Background glow effects */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-r from-emerald-500/20 via-emerald-600/10 to-emerald-500/10 opacity-50 blur-xl" />
          <div className="absolute inset-0 rounded-3xl bg-slate-800/90 backdrop-blur-sm border border-slate-700/50" />

          {/* Animated decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl">
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-b from-emerald-500/30 via-transparent to-transparent rounded-full blur-3xl opacity-20" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-t from-emerald-400/20 via-transparent to-transparent rounded-full blur-3xl opacity-20" />

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]">
              <div className="h-full w-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>
          </div>

          <div className="relative p-8 md:p-12 rounded-3xl overflow-hidden">
            <motion.div
              className="grid md:grid-cols-2 gap-10 items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 py-1.5 px-3 text-sm font-medium text-emerald-400 mb-6">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Limited Time Offer</span>
                  </div>
                </motion.div>

                <motion.h2
                  className="text-3xl md:text-4xl font-bold leading-tight text-white mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Get <span className="text-emerald-400">$100 off</span> when you sign up today
                </motion.h2>

                <motion.p
                  className="text-lg text-slate-300 mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  Join thousands of newsletter creators who use Letterflow to grow their audience
                  and create engaging content that converts.
                </motion.p>

                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-300">{feature}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                className="bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 shadow-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                {!submitted ? (
                  <>
                    <h3 className="text-2xl font-bold text-white mb-4">Get Started for Free</h3>
                    <p className="text-slate-300 mb-6">
                      No credit card required. Start your 14-day trial now.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                          Email address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium flex items-center justify-center gap-2 h-12 shadow-lg shadow-emerald-500/10"
                        size="lg"
                      >
                        <Zap className="h-4 w-4" />
                        <span>Start Your Free Trial</span>
                      </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-700/50 flex items-center justify-center gap-2">
                      <Gift className="h-4 w-4 text-emerald-400" />
                      <p className="text-sm text-slate-400">
                        Special offer:{" "}
                        <span className="text-emerald-400 font-medium">$100 off</span> for early
                        customers
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <div className="flex justify-center mb-4">
                      <div className="h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle className="h-7 w-7 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Thank you for signing up!</h3>
                    <p className="text-slate-300 mb-6">
                      Check your email for confirmation and next steps.
                    </p>
                    <Button
                      asChild
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-lg shadow-emerald-500/10"
                    >
                      <Link href="/dashboard">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
