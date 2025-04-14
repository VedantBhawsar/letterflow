"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function Cta() {
  return (
    <section className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/30 to-white -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,185,129,0.08),transparent)] -z-10" />

      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 via-primary/20 to-purple-100 rounded-xl blur-md opacity-50"></div>
          <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Elevate Your Newsletter Growth Now
                </h2>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Take advantage of our powerful tools and start reaching your
                  growth goals today. Join thousands of newsletter creators
                  already succeeding with Letterflow.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <Button size="lg" asChild>
                    <Link href="/signup">Start a Free Trial</Link>
                  </Button>
                  <Button variant="link" size="lg" asChild>
                    <Link href="#features">Learn More</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
