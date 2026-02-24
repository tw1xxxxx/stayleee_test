import Header from "./components/Header";
import AboutSection from "./components/AboutSection";
import ClientsSection from "./components/ClientsSection";
import FAQSection from "./components/FAQSection";
import ContactsSection from "./components/ContactsSection";
import HeroWrapper from "./components/HeroWrapper";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-beige font-sans relative overflow-x-hidden">
      <Header />

      {/* Hero Section - FIXED for Hard Parallax */}
      <HeroWrapper />

      {/* SCROLLABLE CONTENT LAYER */}
      <div className="relative z-20 pointer-events-none">
        {/* Transparent Spacer to allow scrolling past hero */}
        <div className="h-[100dvh] w-full relative" />

        {/* Content Sections that slide OVER the hero video */}
        <div className="bg-brand-beige relative shadow-[0_-10px_30px_rgba(0,0,0,0.2)] pointer-events-auto min-h-screen will-change-transform rounded-none !rounded-none">
          <AboutSection />
          <ClientsSection />
          <FAQSection />
          <ContactsSection />
        </div>
      </div>
    </div>
  );
}
