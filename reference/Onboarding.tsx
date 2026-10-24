import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Shield, Truck, Clock } from "lucide-react";
import heroSneaker from "@/assets/hero-sneaker.jpg";

const slides = [
  {
    title: "Revive Your",
    highlight: "Sneakers",
    description: "Professional cleaning, restoration & care. Picked up from your door, returned like new.",
    icon: Sparkles,
  },
  {
    title: "Free Door-to-Door",
    highlight: "Pickup",
    description: "We come to you. Schedule a pickup and we'll handle the rest — no hassle, no waiting.",
    icon: Truck,
  },
  {
    title: "Expert Care &",
    highlight: "Protection",
    description: "Certified technicians with premium products. Your sneakers are insured and tracked.",
    icon: Shield,
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/home");
    }
  };

  const slide = slides[currentSlide];
  const SlideIcon = slide.icon;

  return (
    <div className="mobile-container flex flex-col min-h-screen overflow-hidden">
      {/* Hero Image */}
      <div className="relative flex-1 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/30 to-background z-10" />
        <img
          src={heroSneaker}
          alt="Premium sneaker"
          className="w-full h-full object-cover absolute inset-0"
          width={800}
          height={1200}
        />
        {/* Brand */}
        <div className="relative z-20 text-center mt-16">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6">
            <SparkleIcon />
            <span className="text-sm font-medium text-foreground/80">Premium Sneaker Care</span>
          </div>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="relative z-20 px-6 pb-10 pt-4 space-y-6">
        <div className="space-y-3" key={currentSlide}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <SlideIcon size={16} className="text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-display tracking-tight animate-fade-in">
            {slide.title} <span className="gradient-text">{slide.highlight}</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {slide.description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {[
            { value: "10K+", label: "Pairs Cleaned" },
            { value: "4.9★", label: "Rating" },
            { value: "Free", label: "Pickup" },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 glass-card rounded-xl p-3 text-center">
              <p className="text-sm font-display font-bold gradient-text">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-primary" : "w-2 bg-secondary"}`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={nextSlide}
            className="flex-1 gradient-btn py-4 rounded-2xl font-display font-semibold text-base active:scale-[0.97] transition-transform"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          </button>
          {currentSlide < slides.length - 1 && (
            <button
              onClick={() => navigate("/home")}
              className="flex-1 glass-card py-4 rounded-2xl font-display font-semibold text-base text-foreground hover:bg-secondary active:scale-[0.97] transition-all"
            >
              Skip
            </button>
          )}
          {currentSlide === slides.length - 1 && (
            <button
              onClick={() => navigate("/home")}
              className="flex-1 glass-card py-4 rounded-2xl font-display font-semibold text-base text-foreground hover:bg-secondary active:scale-[0.97] transition-all"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 0L9.79 6.21L16 8L9.79 9.79L8 16L6.21 9.79L0 8L6.21 6.21L8 0Z" fill="hsl(192, 100%, 50%)" />
  </svg>
);

export default Onboarding;
