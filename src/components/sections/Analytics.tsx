"use client";

import { useState } from "react";
import {
  LineChart,
  Share2,
  Users,
  PieChart,
  ArrowUp,
  ChevronRight,
  MousePointerClick,
  TrendingUp,
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
    icon: <MousePointerClick className="h-5 w-5" />,
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
                  {Array.from({ length: 12 }).map((_: any, idx: any) => (
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
                {Array.from({ length: 3 }).map((_: any, idx: any) => (
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
              {Array.from({ length: 4 }).map((_: any, idx: any) => (
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
    <section
      className="relative py-24 bg-gradient-to-b from-slate-950 to-slate-900 text-white overflow-hidden"
      id="analytics"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-40 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

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
            <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent text-sm font-medium tracking-wider uppercase">
              Data-Driven Growth
            </span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Get Growth Visualization with Precision Data
          </h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
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
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-lg opacity-80"></div>
            <motion.div
              className="relative rounded-xl overflow-hidden shadow-xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-slate-800/90 backdrop-blur border border-slate-700 p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Subscriber Growth
                  </h3>
                  <div className="flex items-center text-sm bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full">
                    <span className="font-medium">YTD Growth: +500%</span>
                    <ArrowUp className="h-4 w-4 ml-1" />
                  </div>
                </div>

                {/* Growth Chart */}
                <div className="h-64 relative mb-4">
                  <div className="absolute inset-x-0 bottom-0 border-b border-slate-700/50"></div>
                  <div className="absolute inset-y-0 left-0 border-l border-slate-700/50"></div>
                  <div className="absolute inset-0 flex items-end justify-between pb-1">
                    {subscriberData.map((value: any, idx: any) => (
                      <motion.div
                        key={idx}
                        className="flex flex-col items-center w-full"
                        initial={{ height: 0 }}
                        whileInView={{
                          height: `${(value / highestValue) * 100}%`,
                        }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05, duration: 0.5, ease: "backOut" }}
                      >
                        <div
                          className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm relative group cursor-pointer"
                          style={{ height: "100%" }}
                        >
                          <motion.div
                            className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1.5 px-3 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none z-10 border border-slate-600 min-w-20 text-center"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 0 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <span className="block font-semibold">{value}</span>
                            <span className="block text-slate-400 text-[10px]">subscribers</span>
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 border-r border-b border-slate-600 rotate-45"></div>
                          </motion.div>
                        </div>
                        <span className="text-xs mt-2 text-slate-400 font-medium">
                          {monthLabels[idx]}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-8">
                  {engagementMetrics.map((metric: any, idx: any) => (
                    <motion.div
                      key={idx}
                      className={`rounded-xl p-4 border transition-all cursor-pointer ${
                        activeMetric === idx
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : "border-slate-700 hover:border-emerald-500/30 hover:bg-slate-800/50"
                      }`}
                      onClick={() => setActiveMetric(idx)}
                      whileHover={{ y: -3, scale: 1.02 }}
                      variants={itemFadeIn}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm ${activeMetric === idx ? "text-emerald-400" : "text-slate-400"}`}
                        >
                          {metric.name}
                        </span>
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: metric.color }}
                        ></div>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span
                          className={`text-2xl font-bold ${activeMetric === idx ? "text-white" : "text-slate-300"}`}
                        >
                          {metric.value}%
                        </span>
                        <div className="flex items-center text-xs">
                          <span className="text-emerald-400">+{metric.change}%</span>
                          <ArrowUp className="h-3 w-3 text-emerald-400" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Audience breakdown */}
                <div className="mt-8 p-4 border border-slate-700 rounded-xl bg-slate-800/50">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-emerald-400" />
                    Audience Breakdown
                  </h4>
                  <div className="h-3 w-full bg-slate-700/50 rounded-full overflow-hidden flex">
                    {audienceData.map((item: any, idx: any) => (
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
                        transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-3 text-xs">
                    {audienceData.map((item: any, idx: any) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-slate-300">
                          {item.label} <span className="text-slate-400">({item.percentage}%)</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2 space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <div className="space-y-6">
              {features.map((feature: any, index: any) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-5 p-5 rounded-xl hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-700 cursor-pointer group"
                  variants={itemFadeIn}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex-shrink-0 rounded-lg bg-emerald-500/10 p-3 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-white text-lg mb-1 group-hover:text-emerald-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div className="pt-6" variants={itemFadeIn}>
              <Button
                asChild
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-emerald-500/20 transition-all"
              >
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
