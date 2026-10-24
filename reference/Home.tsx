import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Truck, ClipboardList, Sparkles, Crown, Star, Heart, ChevronRight, Gift, Zap, TrendingUp } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import beforeAfter from "@/assets/before-after.jpg";
import cleaningProcess from "@/assets/cleaning-process.jpg";

const reviews = [
  { name: "Sarah M.", rating: 5, text: "My Air Jordans look brand new! Incredible service.", time: "2 days ago", avatar: "S" },
  { name: "James K.", rating: 5, text: "Fast pickup, perfect cleaning. Will use again!", time: "5 days ago", avatar: "J" },
  { name: "Maria L.", rating: 5, text: "The suede care saved my favorite boots. Thank you!", time: "1 week ago", avatar: "M" },
];

const recentActivity = [
  { label: "Deep Clean completed", detail: "Nike Air Max 90", time: "2 days ago", status: "done" },
  { label: "Pickup scheduled", detail: "Adidas Ultraboost", time: "Tomorrow, 2PM", status: "upcoming" },
];

const Home = () => {
  const navigate = useNavigate();
  const [likedReview, setLikedReview] = useState<number | null>(null);
  const [activeTransformation, setActiveTransformation] = useState(0);

  const transformations = [
    { title: "Deep Clean Restoration", subtitle: "White sneaker • 3 days", image: beforeAfter },
    { title: "Expert Care Process", subtitle: "Hand-cleaned by certified technicians", image: cleaningProcess },
  ];

  return (
    <div className="mobile-container pb-28">
      <div className="px-5 pt-12 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground text-sm">Good morning</p>
            <h1 className="text-2xl font-display font-bold mt-1">Hey Alex 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <Gift size={18} className="text-muted-foreground" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">2</span>
            </button>
            <button onClick={() => navigate("/profile")} className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
              <span className="text-sm font-semibold text-primary">A</span>
            </button>
          </div>
        </div>

        {/* Loyalty Points */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/10 flex items-center justify-center">
            <Zap size={22} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Loyalty Points</p>
            <p className="font-display font-bold text-lg gradient-text">1,250 pts</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Next reward</p>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full w-3/4 rounded-full" style={{ background: "var(--gradient-primary)" }} />
              </div>
              <span className="text-[10px] text-primary font-medium">75%</span>
            </div>
          </div>
        </div>

        {/* Promo Banner */}
        <button
          onClick={() => navigate("/booking")}
          className="w-full glass-card rounded-2xl p-5 flex items-center gap-4 group transition-all hover:border-primary/30 active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Truck className="text-primary" size={22} />
          </div>
          <div className="text-left flex-1">
            <p className="font-display font-semibold text-sm">Free Pickup Today</p>
            <p className="text-xs text-muted-foreground mt-0.5">Book before 2 PM for same-day pickup</p>
          </div>
          <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </button>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Sparkles, label: "Book\nCleaning", path: "/booking", badge: null },
            { icon: ClipboardList, label: "Track\nOrder", path: "/orders", badge: "1" },
            { icon: Crown, label: "View\nServices", path: "/services", badge: null },
          ].map(({ icon: Icon, label, path, badge }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="glass-card rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-primary/30 active:scale-[0.96] transition-all group relative"
            >
              {badge && (
                <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">{badge}</span>
              )}
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon size={20} className="text-primary" />
              </div>
              <span className="text-xs font-medium text-center whitespace-pre-line leading-tight">{label}</span>
            </button>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Recent Activity</h2>
            <button onClick={() => navigate("/orders")} className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
              View All <ChevronRight size={14} />
            </button>
          </div>
          {recentActivity.map((item, i) => (
            <button
              key={i}
              onClick={() => navigate("/orders")}
              className="w-full glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 active:scale-[0.98] transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status === "done" ? "bg-primary/20" : "bg-accent/10"}`}>
                {item.status === "done" ? (
                  <Sparkles size={18} className="text-primary" />
                ) : (
                  <Truck size={18} className="text-accent" />
                )}
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <div className="text-right">
                <span className={`text-[10px] font-medium px-2 py-1 rounded-full ${item.status === "done" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                  {item.status === "done" ? "Completed" : "Upcoming"}
                </span>
                <p className="text-[10px] text-muted-foreground mt-1">{item.time}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Transformations Carousel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Transformations</h2>
            <div className="flex gap-1.5">
              {transformations.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTransformation(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeTransformation ? "bg-primary w-6" : "bg-secondary"}`}
                />
              ))}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden relative group cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setActiveTransformation((prev) => (prev + 1) % transformations.length)}>
            <img
              src={transformations[activeTransformation].image}
              alt="Sneaker transformation"
              className="w-full h-48 object-cover transition-opacity duration-500"
              loading="lazy"
              width={800}
              height={512}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <p className="text-sm font-display font-semibold">{transformations[activeTransformation].title}</p>
                <p className="text-xs text-muted-foreground">{transformations[activeTransformation].subtitle}</p>
              </div>
              <div className="flex items-center gap-1 bg-primary/20 px-2 py-1 rounded-full">
                <TrendingUp size={12} className="text-primary" />
                <span className="text-[10px] text-primary font-medium">98% match</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Customer Reviews</h2>
            <div className="flex items-center gap-1">
              <Star size={14} className="text-primary fill-primary" />
              <span className="text-sm font-display font-bold">4.9</span>
              <span className="text-xs text-muted-foreground">(2.4K)</span>
            </div>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory">
            {reviews.map((review, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 min-w-[260px] shrink-0 snap-start space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{review.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{review.name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} size={10} className="text-primary fill-primary" />
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{review.time}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{review.text}</p>
                <button
                  onClick={() => setLikedReview(likedReview === i ? null : i)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Heart size={14} className={likedReview === i ? "fill-primary text-primary" : ""} />
                  Helpful
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription */}
        <div className="glass-card rounded-2xl p-5 border-primary/20 space-y-3">
          <div className="flex items-center gap-2">
            <Crown size={18} className="text-primary" />
            <span className="font-display font-semibold text-sm">Monthly Cleaning Plan</span>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium ml-auto">Save 40%</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Get 2 cleanings per month, priority pickup, and 20% off restoration services.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
              <p className="text-sm font-display font-bold">2</p>
              <p className="text-[10px] text-muted-foreground">Cleanings/mo</p>
            </div>
            <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
              <p className="text-sm font-display font-bold">Priority</p>
              <p className="text-[10px] text-muted-foreground">Pickup</p>
            </div>
            <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
              <p className="text-sm font-display font-bold">20%</p>
              <p className="text-[10px] text-muted-foreground">Discount</p>
            </div>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-2xl font-display font-bold gradient-text">$29</span>
            <span className="text-xs text-muted-foreground mb-1">/month</span>
          </div>
          <button className="w-full gradient-btn py-3 rounded-xl font-display font-semibold text-sm active:scale-[0.97] transition-transform">
            Subscribe Now
          </button>
        </div>
      </div>

      {/* Floating Book Button */}
      <button
        onClick={() => navigate("/booking")}
        className="fixed bottom-24 right-6 max-w-md gradient-btn w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow z-40 active:scale-90 transition-transform"
      >
        <Sparkles size={22} />
      </button>

      <BottomNav />
    </div>
  );
};

export default Home;
