import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export const metadata = {
  title: "Pricing | Letterflow",
  description:
    "Choose the perfect Letterflow plan for your newsletter needs. Simple, transparent pricing with no hidden fees.",
};

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
    description:
      "Perfect for creators just getting started with their newsletter.",
    features: [
      "Up to 2,500 subscribers",
      "Unlimited newsletters",
      "Analytics dashboard",
      "Custom domains",
      "Email support",
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup",
    popular: false,
  },
  {
    name: "Growth",
    price: "$39",
    period: "per month",
    description:
      "Everything you need to grow your audience and monetize your newsletter.",
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
    ctaLink: "/signup",
    popular: true,
  },
  {
    name: "Professional",
    price: "$99",
    period: "per month",
    description:
      "For serious creators with a large audience and advanced needs.",
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
    ctaLink: "/signup",
    popular: false,
  },
];

export default function PricingPage() {
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
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Choose the perfect plan for your newsletter needs. All plans
                include a 14-day free trial.
              </p>
              <div className="inline-flex items-center rounded-full border border-border p-1">
                <button className="rounded-full px-4 py-2 text-sm font-medium bg-primary text-white">
                  Monthly
                </button>
                <button className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground">
                  Yearly (Save 20%)
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="relative py-12 -mt-8">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-white -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  className="flex"
                  variants={itemFadeIn}
                  whileHover={plan.popular ? { scale: 1.02 } : { scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    className={`flex flex-col w-full backdrop-blur-sm bg-white/80 border-border/60 ${
                      plan.popular
                        ? "relative shadow-xl border-primary/40 z-10"
                        : "shadow-md"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <CardHeader className={plan.popular ? "pb-2 pt-8" : "pb-2"}>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-2">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground ml-1">
                          {plan.period}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-2">
                        {plan.description}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            className="flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * featureIndex }}
                            viewport={{ once: true }}
                          >
                            <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <motion.div
                        className="w-full"
                        whileHover={{ scale: 1.03 }}
                      >
                        <Button
                          variant={plan.popular ? "default" : "outline"}
                          size="lg"
                          className="w-full"
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
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/30 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(16,185,129,0.05),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="relative max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 via-primary/20 to-purple-100 rounded-xl blur-md opacity-50"></div>
              <div className="relative rounded-xl border border-border/40 bg-white/80 backdrop-blur-sm p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-grow">
                    <h2 className="text-3xl font-bold mb-4">Enterprise Plan</h2>
                    <p className="text-lg mb-6">
                      Custom solutions for larger newsletters, media companies,
                      and organizations with specific needs.
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
                          className="flex items-center"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          viewport={{ once: true }}
                        >
                          <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-shrink-0 text-center md:text-right">
                    <p className="text-lg font-medium mb-4">
                      Contact us for custom pricing
                    </p>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Button size="lg" asChild>
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
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-white -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-12 text-center">
                Frequently Asked Questions
              </h2>

              <motion.div
                className="space-y-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  {
                    question: "How does the 14-day free trial work?",
                    answer:
                      "You can sign up for any plan with full access to all features. No credit card is required. At the end of your trial, you can choose to subscribe or your account will automatically switch to a limited free plan.",
                  },
                  {
                    question: "What happens if I exceed my subscriber limit?",
                    answer:
                      "We'll notify you when you reach 80% of your limit. If you go over, you'll have a 14-day grace period to upgrade your plan. During this time, your newsletter will continue to function normally.",
                  },
                  {
                    question: "Can I switch plans later?",
                    answer:
                      "Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades will apply at the end of your current billing cycle.",
                  },
                  {
                    question:
                      "Do you offer discounts for non-profits or educational institutions?",
                    answer:
                      "Yes, we offer special pricing for verified non-profits, educational institutions, and student publications. Please contact us for more information.",
                  },
                  {
                    question: "What payment methods do you accept?",
                    answer:
                      "We accept all major credit cards, as well as PayPal. For Enterprise customers, we can also accommodate invoicing and purchase orders.",
                  },
                  {
                    question: "Is there a contract or commitment?",
                    answer:
                      "No, all our plans are month-to-month with no long-term contracts. You can cancel at any time.",
                  },
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-border/60 shadow-sm"
                    variants={itemFadeIn}
                    whileHover={{ y: -5 }}
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-white -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,185,129,0.08),transparent)] -z-10" />

          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-6">
                Ready to Start Your Newsletter Journey?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Join thousands of creators who trust Letterflow to grow and
                monetize their newsletters.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button size="lg" asChild>
                    <Link href="/signup">Start Your Free Trial</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button variant="outline" size="lg" asChild>
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
