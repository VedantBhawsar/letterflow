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
    <div className="min-h-screen flex flex-col relative bg-slate-900 text-white">
      {/* Main background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 -z-10" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] -z-10">
        <div className="h-full w-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-emerald-500/10 via-transparent to-transparent rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent rounded-full blur-3xl opacity-30" />
        <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl opacity-10" />
      </div>

      <Navbar />

      <main className="flex-grow">
        <Hero />

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 -z-10" />
          <EmailBuilder />

          <div className="relative py-16">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
            </div>
          </div>

          <Analytics />
        </div>

        {/* <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 -z-10" />
          <Integrations />
        </div> */}

        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 -z-10" />
          <Blog />
        </div>

        <div className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700/50 to-transparent opacity-70"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 -z-10" />
          <Cta />
        </div>
      </main>

      <Footer />
    </div>
  );
}
