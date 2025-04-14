import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import SocialProof from "@/components/sections/SocialProof";
import EmailBuilder from "@/components/sections/EmailBuilder";
import Analytics from "@/components/sections/Analytics";
import Integrations from "@/components/sections/Integrations";
import Blog from "@/components/sections/Blog";
import Cta from "@/components/sections/Cta";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-slate-100/50 -z-10" />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <SocialProof />
        <EmailBuilder />
        <Analytics />
        <Integrations />
        <Blog />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
