"use client";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users, Heart, Lightbulb, Globe, Zap, Coffee } from "lucide-react";

type JobOpening = {
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
};

type CompanyBenefit = {
  icon: React.ElementType;
  title: string;
  description: string;
};

const jobOpenings: JobOpening[] = [
  {
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "We're looking for a Senior Frontend Engineer to help build and improve our web applications. You'll work closely with our design and product teams to create intuitive, responsive, and accessible user interfaces.",
  },
  {
    title: "Backend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "Join our backend team to design, build, and maintain our server infrastructure, APIs, and data systems. You'll help ensure our platform is scalable, secure, and performant as we grow.",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    description:
      "We're seeking a talented Product Designer to help shape the user experience of our platform. You'll collaborate with engineering and product teams to create beautiful, functional designs that solve real user problems.",
  },
  {
    title: "Growth Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description:
      "Drive our customer acquisition and retention strategies as our Growth Marketing Manager. You'll develop campaigns, analyze user behavior, and optimize our marketing funnel.",
  },
  {
    title: "Customer Success Specialist",
    department: "Customer Success",
    location: "Remote",
    type: "Full-time",
    description:
      "Help our customers get the most out of Letterflow by providing exceptional support, creating educational content, and gathering feedback to improve our product.",
  },
  {
    title: "Content Marketing Specialist",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    description:
      "Create compelling content that educates our audience about newsletter best practices, analytics, and how Letterflow can help them succeed.",
  },
];

const companyBenefits: CompanyBenefit[] = [
  {
    icon: Globe,
    title: "Remote-First Culture",
    description:
      "Work from anywhere in the world. We believe in hiring the best talent, regardless of location.",
  },
  {
    icon: Users,
    title: "Inclusive Environment",
    description:
      "We're committed to building a diverse team and creating a workplace where everyone belongs.",
  },
  {
    icon: Coffee,
    title: "Flexible Hours",
    description:
      "We understand that everyone works differently. Set a schedule that works for you and your team.",
  },
  {
    icon: Heart,
    title: "Comprehensive Benefits",
    description:
      "Health insurance, retirement plans, and generous time off to ensure you stay healthy and happy.",
  },
  {
    icon: Lightbulb,
    title: "Growth Opportunities",
    description:
      "Regular feedback, education stipends, and clear paths for advancement within the company.",
  },
  {
    icon: Zap,
    title: "Make an Impact",
    description:
      "Join a small but mighty team where your work directly affects the company's success.",
  },
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

export default function CareersPage() {
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
              <p className="text-xl text-muted-foreground">
                Help us build the future of newsletter creation and audience growth
              </p>
            </motion.div>
          </div>
        </section>

        {/* About Working at Letterflow */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-white -z-10" />

          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
              >
                <h2 className="text-3xl font-bold mb-6">Life at Letterflow</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    At Letterflow, we're passionate about helping newsletter creators succeed. We're
                    building a company where talented people can do their best work in a supportive
                    and collaborative environment.
                  </p>
                  <p>
                    We value diversity of thought, background, and experience. Our team is
                    distributed across the globe, allowing us to bring together the best talent
                    regardless of location.
                  </p>
                  <p>
                    We're a small but growing team, which means you'll have the opportunity to make
                    a significant impact and grow your career as we scale.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={fadeIn}
              >
                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/30 to-blue-500/30 blur opacity-70"></div>
                <div className="relative h-[400px] rounded-xl border border-border/40 bg-white/95 backdrop-blur shadow-xl overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"
                    alt="Team collaboration at Letterflow"
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50/30 -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_100%,rgba(16,185,129,0.05),transparent)] -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4">Our Benefits</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We believe in taking care of our team and providing an environment where you can
                thrive.
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {companyBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/60 p-6"
                  variants={itemFadeIn}
                >
                  <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="relative py-20">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 to-white -z-10" />

          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join our team and help shape the future of Letterflow.
              </p>
            </motion.div>

            <motion.div
              className="max-w-4xl mx-auto space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {jobOpenings.map((job, index) => (
                <motion.div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-border/60 p-6"
                  variants={itemFadeIn}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="md:flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{job.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {job.department}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {job.location}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {job.type}
                        </span>
                      </div>
                      <p className="mt-3 text-muted-foreground">{job.description}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <Button>Apply Now</Button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How We Hire */}
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
              <h2 className="text-3xl font-bold mb-6 text-center">Our Hiring Process</h2>

              <motion.ol
                className="relative border-l border-primary/30 ml-3 mt-8 space-y-8"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={staggerContainer}
              >
                {[
                  {
                    title: "Application Review",
                    description:
                      "We review your application and resume to determine if there's a potential fit.",
                  },
                  {
                    title: "Initial Interview",
                    description:
                      "A conversation with our hiring team to learn more about you and your experience.",
                  },
                  {
                    title: "Technical Assessment",
                    description: "A practical assignment relevant to the role you're applying for.",
                  },
                  {
                    title: "Team Interviews",
                    description:
                      "Meet potential teammates and get a better sense of our culture and work environment.",
                  },
                  {
                    title: "Offer",
                    description:
                      "If there's a mutual fit, we'll extend an offer and welcome you to the team!",
                  },
                ].map((step, index) => (
                  <motion.li key={index} className="ml-6" variants={itemFadeIn}>
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full -left-4 text-sm border border-white">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-lg">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </motion.li>
                ))}
              </motion.ol>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
