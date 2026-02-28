import {
  Navigation,
  Hero,
  Features,
  AppShowcase,
  Testimonials,
  Footer,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-[#6155F5]/30 selection:text-[#B89FFF]">
      {/* Progressive Blur Top */}
      <div className="gradient-blur fixed top-0 w-full h-[12%] z-10 pointer-events-none">
        <div className="absolute inset-0 backdrop-blur-[0.5px]" style={{ mask: "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,0) 37.5%)" }} />
        <div className="absolute inset-0 backdrop-blur-[1px]" style={{ mask: "linear-gradient(to top, rgba(0,0,0,0) 12.5%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 37.5%, rgba(0,0,0,0) 50%)" }} />
        <div className="absolute inset-0 backdrop-blur-[2px]" style={{ mask: "linear-gradient(to top, rgba(0,0,0,0) 25%, rgba(0,0,0,1) 37.5%, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 62.5%)" }} />
        <div className="absolute inset-0 backdrop-blur-[4px]" style={{ mask: "linear-gradient(to top, rgba(0,0,0,0) 37.5%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 62.5%, rgba(0,0,0,0) 75%)" }} />
        <div className="absolute inset-0 backdrop-blur-[8px]" style={{ mask: "linear-gradient(to top, rgba(0,0,0,0) 50%, rgba(0,0,0,1) 62.5%, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 87.5%)" }} />
        <div className="absolute inset-0 backdrop-blur-[16px]" style={{ mask: "linear-gradient(to top, rgba(0,0,0,0) 62.5%, rgba(0,0,0,1) 75%, rgba(0,0,0,1) 87.5%, rgba(0,0,0,0) 100%)" }} />
      </div>

      {/* Background glow */}
      <div className="fixed top-0 w-full h-screen mix-blend-screen brightness-50 opacity-50 saturate-0 z-0 pointer-events-none" style={{ maskImage: "linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)" }}>
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(97,85,245,0.1),_transparent_70%)]" />
      </div>

      <Navigation />
      <Hero />
      <Features />
      <AppShowcase />
      <Testimonials />
      <Footer />
    </main>
  );
}
