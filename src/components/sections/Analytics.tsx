"use client";

import { useState } from "react";
import {
  LineChart,
  BarChart,
  Share2,
  Users,
  PieChart,
  ArrowUp,
  ArrowDown,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const features = [
  {
    icon: <LineChart className="h-5 w-5" />,
    title: "Interactive Charts",
    description: "Visualize your newsletter performance with interactive and customizable charts.",
  },
  {
    icon: <BarChart className="h-5 w-5" />,
    title: "Engagement Analytics",
    description: "Track opens, clicks, and other metrics to understand audience behavior.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Audience Insights",
    description: "Gain demographic and behavioral insights about your subscribers.",
  },
  {
    icon: <Share2 className="h-5 w-5" />,
    title: "Data Export and Sharing",
    description: "Easily export data in multiple formats or share insights with your team.",
  },
];

// Sample data for growth chart
const subscriberData = [120, 145, 190, 210, 260, 320, 390, 450, 510, 580, 640, 720];
const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Sample data for engagement metrics
const engagementMetrics = [
  { name: "Opens", value: 68, change: 12, color: "#10B981" },
  { name: "Clicks", value: 42, change: 8, color: "#3B82F6" },
  { name: "Shares", value: 15, change: 5, color: "#8B5CF6" },
];

// Sample data for audience breakdown
const audienceData = [
  { label: "Desktop", percentage: 45, color: "#10B981" },
  { label: "Mobile", percentage: 38, color: "#3B82F6" },
  { label: "Tablet", percentage: 17, color: "#8B5CF6" },
];

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
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function AnalyticsSkeleton() {
  return (
    <section className="relative py-24" id="analytics">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-blue-50/20 -z-10" />
      <div className="absolute inset-y-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/40 to-transparent -z-10" />
      <div className="absolute top-1/4 left-0 w-1/3 h-1/2 bg-gradient-to-r from-primary/5 to-transparent -z-10" />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Skeleton className="h-10 w-2/3 mx-auto mb-4" />
          <Skeleton className="h-5 w-full mx-auto" />
          <Skeleton className="h-5 w-4/5 mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-primary/20 blur-lg opacity-70"></div>
            <div className="relative rounded-xl border border-border/40 bg-white/90 overflow-hidden shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-5 w-32" />
              </div>

              {/* Growth Chart Skeleton */}
              <div className="h-64 relative">
                <div className="flex items-end justify-between w-full h-full">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <div key={idx} className="flex flex-col items-center w-full">
                      <Skeleton
                        className="w-full rounded-t-sm"
                        style={{
                          height: `${Math.random() * 60 + 20}%`,
                        }}
                      />
                      <Skeleton className="h-3 w-6 mt-1" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="rounded-lg p-3 border border-gray-100">
                    <Skeleton className="h-5 w-20 mb-2" />
                    <div className="flex items-baseline">
                      <Skeleton className="h-7 w-10 mr-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <Skeleton className="h-8 w-56 mb-4" />
            <Skeleton className="h-5 w-full mb-8" />

            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Analytics() {
  const [activeMetric, setActiveMetric] = useState(0);
  const highestValue = Math.max(...subscriberData);

  return (
    <section className="relative py-24" id="analytics">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-blue-50/20 -z-10" />
      <div className="absolute inset-y-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/40 to-transparent -z-10" />
      <div className="absolute top-1/4 left-0 w-1/3 h-1/2 bg-gradient-to-r from-primary/5 to-transparent -z-10" />

      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Get Growth Visualization with Precision Data
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your newsletter growth and engagement with interactive visualizations and
            actionable insights.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            className="order-2 lg:order-1 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 to-primary/20 blur-lg opacity-70"></div>
            <div className="relative rounded-xl border border-border/40 bg-white/90 overflow-hidden shadow-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Subscriber Growth</h3>
                <div className="flex items-center text-sm text-primary">
                  <span className="font-medium">YTD Growth: +500%</span>
                  <ArrowUp className="h-4 w-4 ml-1" />
                </div>
              </div>

              {/* Growth Chart */}
              <div className="h-64 relative">
                <div className="absolute inset-0 flex items-end justify-between">
                  {subscriberData.map((value, idx) => (
                    <motion.div
                      key={idx}
                      className="flex flex-col items-center w-full"
                      initial={{ height: 0 }}
                      whileInView={{
                        height: `${(value / highestValue) * 100}%`,
                      }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05, duration: 0.5 }}
                    >
                      <div
                        className="w-full bg-gradient-to-t from-primary/80 to-primary/50 rounded-t-sm relative group"
                        style={{ height: "100%" }}
                      >
                        <motion.div
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          {value} subscribers
                        </motion.div>
                      </div>
                      <span className="text-xs mt-1 text-gray-500">{monthLabels[idx]}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {engagementMetrics.map((metric, idx) => (
                  <motion.div
                    key={idx}
                    className={`rounded-lg p-3 border transition-all cursor-pointer ${
                      activeMetric === idx
                        ? "border-primary/50 bg-primary/5"
                        : "border-gray-100 hover:border-primary/30"
                    }`}
                    onClick={() => setActiveMetric(idx)}
                    whileHover={{ y: -2 }}
                    variants={itemFadeIn}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{metric.name}</span>
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: metric.color }}
                      ></div>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-xl font-bold">{metric.value}%</span>
                      <div className="flex items-center text-xs">
                        <span className="text-green-500">+{metric.change}%</span>
                        <ArrowUp className="h-3 w-3 text-green-500" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Audience breakdown */}
              <div className="mt-6 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <PieChart className="h-10 w-10 text-primary/40" />
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Audience Breakdown</h4>
                  <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                    {audienceData.map((item, idx) => (
                      <motion.div
                        key={idx}
                        className="h-full"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    {audienceData.map((item, idx) => (
                      <div key={idx} className="flex items-center">
                        <div
                          className="h-2 w-2 rounded-full mr-1"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>
                          {item.label} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2 space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                  variants={itemFadeIn}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex-shrink-0 rounded-full bg-primary/10 p-2 text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div className="pt-4" variants={itemFadeIn}>
              <Button asChild>
                <Link href="/features" className="flex items-center gap-2">
                  Explore all analytics features
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
