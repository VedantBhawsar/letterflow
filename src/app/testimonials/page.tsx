"use client";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// export const metadata = {
//   title: "Testimonials | Letterflow",
//   description:
//     "Hear from the newsletter creators who have grown their audience and improved their content with Letterflow.",
// };

const testimonials = [
  {
    name: "Sarah Johnson",
    position: "Founder, The Weekly Insight",
    quote:
      "Letterflow transformed my newsletter workflow. The analytics helped me understand what content resonates with my audience, and I've doubled my subscriber count in just 3 months.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=774&auto=format&fit=crop",
    rating: 5,
    category: "Growth",
  },
  {
    name: "David Chen",
    position: "Creator, Tech Futures",
    quote:
      "The email builder is a game-changer. I used to spend hours designing my newsletter, now it takes me 30 minutes. The templates are beautiful and the interface is intuitive.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=774&auto=format&fit=crop",
    rating: 5,
    category: "Design",
  },
  {
    name: "Maya Patel",
    position: "Editor, Finance Weekly",
    quote:
      "I've tried several newsletter platforms, but Letterflow offers the perfect balance of power and simplicity. The A/B testing feature helped me increase my open rate by 22%.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=776&auto=format&fit=crop",
    rating: 5,
    category: "Analytics",
  },
  {
    name: "James Wilson",
    position: "Author, Creative Corner",
    quote:
      "The segmentation feature allows me to send targeted content to different subscriber groups. My engagement has never been higher, and I'm seeing real results from my newsletter.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=774&auto=format&fit=crop",
    rating: 4,
    category: "Segmentation",
  },
  {
    name: "Sophia Lee",
    position: "Marketer, Brand Builders",
    quote:
      "Letterflow's integrations with my existing tools made the transition seamless. I can focus on creating great content while the platform handles the technical aspects.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=776&auto=format&fit=crop",
    rating: 5,
    category: "Integrations",
  },
  {
    name: "Marcus Taylor",
    position: "CEO, Growth Hackers",
    quote:
      "We use Letterflow for our company newsletter, and the analytics have been invaluable for understanding our audience. The support team is also incredibly responsive.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=774&auto=format&fit=crop",
    rating: 5,
    category: "Support",
  },
  {
    name: "Olivia Garcia",
    position: "Creator, Health & Wellness Weekly",
    quote:
      "Moving to Letterflow was the best decision for my newsletter. The growth in my subscriber base and engagement has been remarkable, and the platform is a joy to use.",
    image:
      "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=774&auto=format&fit=crop",
    rating: 5,
    category: "Growth",
  },
  {
    name: "Ryan Park",
    position: "Indie Creator, The Minimalist",
    quote:
      "As a solo creator, I need tools that save me time. Letterflow's automation features and user-friendly design allow me to focus on writing rather than technical details.",
    image:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=773&auto=format&fit=crop",
    rating: 4,
    category: "Efficiency",
  },
  {
    name: "Emma Thompson",
    position: "Writer, Literary Digest",
    quote:
      "The templates and customization options are perfect for my literary newsletter. I've received countless compliments on the design since switching to Letterflow.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=764&auto=format&fit=crop",
    rating: 5,
    category: "Design",
  },
];

const categories = [
  "All",
  "Growth",
  "Design",
  "Analytics",
  "Segmentation",
  "Integrations",
  "Support",
  "Efficiency",
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function TestimonialsPage() {
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">What Our Customers Say</h1>
              <p className="text-xl text-muted-foreground">
                Hear from the newsletter creators who have grown their audience and improved their
                content with Letterflow.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Testimonial */}
        <section className="relative py-12 -mt-8">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-white -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="relative max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-100 via-primary/20 to-purple-100 rounded-xl blur-md opacity-50"></div>
              <Card className="relative backdrop-blur-sm bg-white/80 border-border/60 p-8 md:p-12">
                <div className="absolute top-6 right-8 text-primary">
                  <Quote className="h-12 w-12 opacity-10" />
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/3 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full mb-4 overflow-hidden relative">
                      <Image
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=774&auto=format&fit=crop"
                        alt="Sarah Johnson"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold">Sarah Johnson</h3>
                    <p className="text-muted-foreground">Founder, The Weekly Insight</p>
                    <div className="flex mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <blockquote className="text-xl italic">
                      I was struggling to grow my newsletter beyond a few hundred subscribers for
                      months. Since switching to Letterflow, I&apos;ve been able to grow to over
                      10,000 subscribers in just 6 months. The analytics tools helped me understand
                      what content resonates, and the email builder made my newsletter look
                      professional without any design skills. It&apos;s completely transformed my
                      business.&quot;
                    </blockquote>
                    <div className="mt-6">
                      <p className="text-primary font-medium">Results:</p>
                      <p className="text-muted-foreground">
                        20x growth in subscribers in 6 months
                        <br />
                        45% increase in open rates
                        <br />
                        Successfully monetized with premium subscriptions
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Testimonial Categories */}
        <section className="relative py-12">
          <div className="container mx-auto px-4">
            <motion.div
              className="flex flex-wrap justify-center gap-2 mb-12"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {categories.map((category, index) => (
                <motion.button
                  key={index}
                  variants={itemFadeIn}
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === "All"
                      ? "bg-primary text-white"
                      : "bg-white/80 border border-border hover:border-primary/30"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonial Grid */}
        <section className="relative py-12">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/30 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(16,185,129,0.05),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div key={index} variants={itemFadeIn} whileHover={{ y: -5 }}>
                  <Card className="backdrop-blur-sm bg-white/80 border-border/60 p-6 h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden relative">
                          <Image
                            src={testimonial.image}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{testimonial.name}</h3>
                          <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                        ))}
                        {[...Array(5 - testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-muted" />
                        ))}
                      </div>
                    </div>
                    <blockquote className="italic text-muted-foreground mb-4">
                      &apos;{testimonial.quote}&apos;
                    </blockquote>
                    <div className="mt-auto">
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                        {testimonial.category}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Video Testimonials */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-white -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-3xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4">Video Success Stories</h2>
              <p className="text-lg text-muted-foreground">
                Watch how these creators have transformed their newsletters with Letterflow.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {[
                {
                  title: "How The Weekly Insight Grew to 10,000 Subscribers",
                  creator: "Sarah Johnson",
                  duration: "4:36",
                  image:
                    "https://images.unsplash.com/photo-1591115765373-5207764f72e4?q=80&w=2070&auto=format&fit=crop",
                },
                {
                  title: "Redesigning Tech Futures with Letterflow",
                  creator: "David Chen",
                  duration: "5:12",
                  image:
                    "https://images.unsplash.com/photo-1540655037529-e1c91a35a74c?q=80&w=2070&auto=format&fit=crop",
                },
                {
                  title: "Analytics-Driven Growth for Finance Weekly",
                  creator: "Maya Patel",
                  duration: "3:45",
                  image:
                    "https://images.unsplash.com/photo-1567443024551-f3e3a7b3ac89?q=80&w=2070&auto=format&fit=crop",
                },
              ].map((video, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  variants={itemFadeIn}
                  whileHover={{ scale: 1.03 }}
                >
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground mb-3 overflow-hidden relative">
                    <Image src={video.image} alt={video.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white translate-x-0.5"
                        >
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg">{video.title}</h3>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{video.creator}</span>
                    <span>{video.duration}</span>
                  </div>
                </motion.div>
              ))}
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
              <h2 className="text-3xl font-bold mb-6">Join Our Growing Community</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Experience the platform that has helped thousands of newsletter creators grow their
                audience and create better content.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button size="lg" asChild>
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/features">Explore Features</Link>
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
