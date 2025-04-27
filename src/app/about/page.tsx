import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "About Us | Letterflow",
  description:
    "Learn about Letterflow's mission to empower newsletter creators with powerful tools and analytics.",
};

export default function AboutPage() {
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
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About Letterflow</h1>
              <p className="text-xl text-muted-foreground">
                We&apos;re on a mission to empower newsletter creators with powerful tools,
                insightful analytics, and beautiful designs.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="relative py-20 -mt-8">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-white -z-10" />

          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/60 p-8 mb-12">
                <div className="prose prose-slate max-w-none">
                  <p className="text-lg">
                    Letterflow was born in 2021 when our founders, experienced newsletter creators
                    themselves, recognized a gap in the market. While there were many email
                    marketing platforms available, none were specifically designed for the unique
                    needs of newsletter creators.
                  </p>
                  <p className="text-lg">
                    We set out to build a platform that would provide the perfect balance of
                    powerful features, intuitive design, and meaningful analytics to help creators
                    grow their audience and improve their content.
                  </p>
                  <p className="text-lg">
                    What started as a small team of three has now grown into a diverse company of
                    passionate individuals dedicated to supporting the thriving newsletter
                    ecosystem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission and Values */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/30 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(16,185,129,0.05),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Mission & Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide our product decisions, team culture, and customer
                relationships.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/60 p-8">
                <h3 className="text-xl font-bold mb-4 text-primary">Empowering Creators</h3>
                <p className="text-muted-foreground">
                  We believe in democratizing publishing by providing tools that enable anyone to
                  create professional, engaging newsletters regardless of technical expertise.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/60 p-8">
                <h3 className="text-xl font-bold mb-4 text-primary">Data-Driven Insights</h3>
                <p className="text-muted-foreground">
                  We&apos;re committed to providing actionable analytics that help creators
                  understand their audience and optimize their content strategy.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/60 p-8">
                <h3 className="text-xl font-bold mb-4 text-primary">Design Excellence</h3>
                <p className="text-muted-foreground">
                  Beautiful, functional design is at the heart of our product. We believe
                  newsletters should be as visually appealing as they are informative.
                </p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/60 p-8">
                <h3 className="text-xl font-bold mb-4 text-primary">Creator-First Support</h3>
                <p className="text-muted-foreground">
                  Our customer support team is made up of experienced newsletter creators who
                  understand your challenges and can provide real, practical advice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-white -z-10" />

          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The passionate people behind Letterflow who are dedicated to helping newsletter
                creators succeed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  name: "Alex Rodriguez",
                  role: "Co-Founder & CEO",
                  bio: "Former newsletter creator with over 100,000 subscribers. Alex brings a deep understanding of creators' needs.",
                  image: "/alex-rodriguez.jpg",
                },
                {
                  name: "Jamie Chen",
                  role: "Co-Founder & CTO",
                  bio: "Tech veteran who previously built publishing tools at major tech companies. Focused on making complex technology accessible.",
                  image: "/jamie-chen.jpg",
                },
                {
                  name: "Taylor Morgan",
                  role: "Co-Founder & Head of Product",
                  bio: "Product designer with a background in UX research. Passionate about creating intuitive, beautiful newsletter experiences.",
                  image: "/taylor-morgan.jpg",
                },
                {
                  name: "Sam Wilson",
                  role: "Lead Developer",
                  bio: "Full-stack engineer who specializes in creating scalable, high-performance web applications.",
                  image: "/sam-wilson.jpg",
                },
                {
                  name: "Nia Johnson",
                  role: "Head of Customer Success",
                  bio: "Former newsletter strategist who has helped dozens of publications grow their audiences and engagement.",
                  image: "/nia-johnson.jpg",
                },
                {
                  name: "Raj Patel",
                  role: "Analytics Lead",
                  bio: "Data scientist with expertise in audience analytics and content optimization for digital publishers.",
                  image: "/raj-patel.jpg",
                },
              ].map((member: any, index: number) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/60 p-6 flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 rounded-full bg-muted mb-4 flex items-center justify-center text-muted-foreground">
                    Photo
                  </div>
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-primary text-sm font-medium mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/30 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(16,185,129,0.05),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Key milestones in the Letterflow story as we&apos;ve grown and evolved.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <div className="space-y-12">
                {[
                  {
                    year: "2021",
                    title: "Letterflow Founded",
                    description:
                      "Three newsletter creators come together to build the platform they always wanted.",
                  },
                  {
                    year: "2021",
                    title: "First Beta Release",
                    description:
                      "The initial version launches with 100 beta testers providing valuable feedback.",
                  },
                  {
                    year: "2022",
                    title: "Public Launch",
                    description:
                      "Letterflow opens to the public with our core email builder and analytics features.",
                  },
                  {
                    year: "2022",
                    title: "1,000 Active Creators",
                    description:
                      "We reach our first major milestone of 1,000 newsletter creators using the platform.",
                  },
                  {
                    year: "2023",
                    title: "Advanced Analytics Suite",
                    description:
                      "Launch of our comprehensive analytics features to help creators deeply understand their audience.",
                  },
                  {
                    year: "2023",
                    title: "10,000 Active Creators",
                    description:
                      "Letterflow continues to grow, now serving 10,000 newsletter creators worldwide.",
                  },
                  {
                    year: "2024",
                    title: "Team Expansion",
                    description:
                      "Our team grows to 25 people across product, engineering, design, and customer success.",
                  },
                  {
                    year: "Today",
                    title: "Constant Improvement",
                    description:
                      "We continue to enhance the platform based on creator feedback and emerging industry needs.",
                  },
                ].map((milestone: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {milestone.year}
                      </div>
                      {index < 7 && <div className="w-0.5 h-16 bg-border mt-2"></div>}
                    </div>
                    <div className="pt-2">
                      <h3 className="font-semibold text-lg">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-white -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(16,185,129,0.08),transparent)] -z-10" />

          <div className="container mx-auto px-4 text-center">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 via-primary/20 to-purple-100 rounded-xl blur-md opacity-50"></div>
              <div className="relative backdrop-blur-sm bg-white/80 border-border/60 p-8 rounded-xl">
                <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
                  We&apos;re always looking for passionate, talented people to help us build the
                  future of newsletters.
                </p>
                <Button size="lg" asChild>
                  <Link href="/careers">View Open Positions</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
