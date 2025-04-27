"use client"; // Make this component a Client Component

import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

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

const plans = [
  {
    name: "Starter",
    price: "$15",
    period: "per month",
    description: "Perfect for creators just getting started with their newsletter.",
    features: [
      "Up to 2,500 subscribers",
      "Unlimited newsletters",
      "Analytics dashboard",
      "Custom domains",
      "Email support",
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup", // Assuming signup route exists
    popular: false,
  },
  {
    name: "Growth",
    price: "$39",
    period: "per month",
    description: "Everything you need to grow your audience and monetize your newsletter.",
    features: [
      "Up to 10,000 subscribers",
      "Unlimited newsletters",
      "Advanced analytics",
      "A/B testing",
      "Subscriber segments",
      "Premium templates",
      "Integrations",
      "Priority support",
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup", // Assuming signup route exists
    popular: true,
  },
  {
    name: "Professional",
    price: "$99",
    period: "per month",
    description: "For serious creators with a large audience and advanced needs.",
    features: [
      "Up to 50,000 subscribers",
      "All Growth features",
      "Dedicated account manager",
      "API access",
      "White-label experience",
      "Advanced automation",
      "Team collaborators",
      "24/7 priority support",
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup", // Assuming signup route exists
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-slate-100/50 -z-10" />

      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-white to-blue-50/50 -z-10" />
          <div className="absolute top-0 left-1/3 w-2/3 h-1/3 bg-gradient-to-r from-primary/10 to-purple-200/20 blur-3xl rounded-full -z-10 opacity-50" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-16"
              initial="hidden"
              animate="visible" // Use animate for initial load animation
              variants={fadeIn}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
              <p className="text-xl text-muted-foreground mb-8">
                Choose the perfect plan for your newsletter needs. All plans include a 14-day free
                trial.
              </p>
              {/* Optional: Add state for monthly/yearly toggle if needed */}
              <div className="inline-flex items-center rounded-full border border-border p-1 bg-background/50 backdrop-blur-sm">
                <button className="rounded-full px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground shadow-sm">
                  Monthly
                </button>
                <button className="rounded-full px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Yearly (Save 20%)
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="relative py-12 -mt-16">
          <div className="container mx-auto px-4">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }} // Adjust viewport amount
              variants={staggerContainer}
            >
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name} // Use a unique key like plan name
                  className="flex" // Ensure motion div takes flex behaviour
                  variants={itemFadeIn}
                  // Optional: Tweak hover effect for less jarring movement
                  whileHover={{
                    scale: 1.03,
                    transition: { type: "spring", stiffness: 400, damping: 15 },
                  }}
                >
                  <Card
                    className={`flex flex-col w-full overflow-hidden rounded-xl transition-all duration-300 ${
                      plan.popular
                        ? "relative shadow-xl border-2 border-primary/60 bg-white/90 backdrop-blur-md z-10"
                        : "shadow-md border border-border/60 bg-white/80 backdrop-blur-sm hover:shadow-lg"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full shadow-md">
                        Most Popular
                      </div>
                    )}
                    <CardHeader className={plan.popular ? "pt-10 pb-4" : "pt-6 pb-4"}>
                      <CardTitle className="text-2xl font-semibold">{plan.name}</CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                        <span className="text-sm text-muted-foreground ml-1.5">{plan.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 min-h-[40px]">
                        {plan.description}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-grow pt-4 pb-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            className="flex items-start text-sm"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + featureIndex * 0.05 }}
                          >
                            <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-4 pb-6">
                      <motion.div
                        className="w-full"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <Button
                          variant={plan.popular ? "default" : "outline"}
                          size="lg"
                          className="w-full font-semibold"
                          asChild
                        >
                          <Link href={plan.ctaLink}>{plan.cta}</Link>
                        </Button>
                      </motion.div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Enterprise Plan */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50/20 to-slate-100/30 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(16,185,129,0.04),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="relative max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-100/50 via-primary/10 to-purple-100/50 rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 -z-10"></div>
              <div className="relative rounded-xl border border-border/30 bg-white/85 backdrop-blur-lg p-8 md:p-12 shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-grow">
                    <h2 className="text-3xl font-semibold mb-4">Enterprise Plan</h2>
                    <p className="text-lg text-muted-foreground mb-6">
                      Custom solutions for larger newsletters, media companies, and organizations
                      with specific needs.
                    </p>
                    <ul className="space-y-2 mb-8 md:mb-0">
                      {[
                        "Unlimited subscribers",
                        "Custom integrations",
                        "Dedicated infrastructure",
                        "SSO and advanced security",
                        "Onboarding and training",
                        "SLA with 24/7 support",
                      ].map((feature, index) => (
                        <motion.li
                          key={index}
                          className="flex items-center text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                        >
                          <CheckCircle className="h-5 w-5 text-primary mr-3 flex-shrink-0" />
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-shrink-0 text-center md:text-left mt-6 md:mt-0">
                    <p className="text-base font-medium mb-4">Contact us for custom pricing</p>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      {/* CORRECTED LINE BELOW */}
                      <Button size="lg" className="font-semibold" asChild>
                        <Link href="/contact">Get in Touch</Link>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100/40 to-white -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>

              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  {
                    question: "How does the 14-day free trial work?",
                    answer:
                      "Sign up for any plan and get full access for 14 days, no credit card required. Afterwards, choose a paid plan or your account will switch to a limited free version.",
                  },
                  {
                    question: "What happens if I exceed my subscriber limit?",
                    answer:
                      "We'll notify you at 80% capacity. If you exceed the limit, you'll have a 14-day grace period to upgrade while your newsletter continues sending normally.",
                  },
                  {
                    question: "Can I switch plans later?",
                    answer:
                      "Yes, upgrade or downgrade anytime. Upgrades are immediate; downgrades apply at the end of your current billing cycle.",
                  },
                  {
                    question: "Do you offer discounts for non-profits or education?",
                    answer:
                      "Yes! We provide special pricing for verified non-profits, educational institutions, and student publications. Please contact us for details.",
                  },
                  {
                    question: "What payment methods do you accept?",
                    answer:
                      "We accept all major credit cards and PayPal. For Enterprise plans, invoicing and purchase orders can be arranged.",
                  },
                  {
                    question: "Is there a contract or commitment?",
                    answer:
                      "No long-term contracts. All plans are typically month-to-month (unless you choose an annual plan), and you can cancel anytime.",
                  },
                ].map((faq, index) => (
                  <motion.div
                    key={faq.question}
                    className="bg-white/85 backdrop-blur-md rounded-lg p-6 border border-border/40 shadow-sm transition-shadow hover:shadow-md"
                    variants={itemFadeIn}
                  >
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-100/30 to-primary/5 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_50%_0%,rgba(16,185,129,0.06),transparent)] -z-10" />
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeIn}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Your Newsletter Journey?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                Join thousands of creators who trust Letterflow to grow and monetize their
                newsletters. Start building your audience today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {/* CORRECTED LINE BELOW */}
                  <Button size="lg" className="font-semibold px-8 py-3" asChild>
                    <Link href="/signup">Start Your Free Trial</Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  {/* CORRECTED LINE BELOW */}
                  <Button variant="outline" size="lg" className="font-semibold px-8 py-3" asChild>
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
