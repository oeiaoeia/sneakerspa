import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ArrowRight, Star, ChevronDown, ChevronUp, Check, Shield, Droplets, Brush, SprayCan } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const services = [
  {
    name: "Basic Clean",
    price: "$25",
    time: "1-2 days",
    description: "Surface cleaning, lace wash, and deodorization for everyday freshness.",
    rating: 4.8,
    reviews: 342,
    popular: false,
    icon: Droplets,
    color: "from-blue-500/20 to-cyan-500/10",
    includes: ["Surface dirt removal", "Lace wash & whitening", "Deodorization", "Quick dry"],
  },
  {
    name: "Deep Clean",
    price: "$45",
    time: "2-3 days",
    description: "Full disassembly cleaning, stain removal, and sole restoration.",
    rating: 4.9,
    reviews: 528,
    popular: true,
    icon: Brush,
    color: "from-purple-500/20 to-blue-500/10",
    includes: ["Full disassembly", "Deep stain removal", "Sole whitening & restoration", "Insole replacement", "Protective coating"],
  },
  {
    name: "Premium Restoration",
    price: "$75",
    time: "3-5 days",
    description: "Complete restoration including color touch-up, re-gluing, and protective coating.",
    rating: 5.0,
    reviews: 189,
    popular: false,
    icon: SprayCan,
    color: "from-amber-500/20 to-orange-500/10",
    includes: ["Everything in Deep Clean", "Color touch-up & repainting", "Re-gluing & structural repair", "Premium protective coating", "Before/after photo report"],
  },
  {
    name: "Suede Care",
    price: "$55",
    time: "2-4 days",
    description: "Specialized suede and nubuck treatment with waterproof protection.",
    rating: 4.9,
    reviews: 215,
    popular: false,
    icon: Shield,
    color: "from-emerald-500/20 to-teal-500/10",
    includes: ["Gentle suede brushing", "Stain & scuff removal", "Color restoration", "Waterproof nano-coating", "Suede protector spray"],
  },
];

const Services = () => {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [selectedCompare, setSelectedCompare] = useState<number[]>([]);

  const toggleCompare = (i: number) => {
    setSelectedCompare((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : prev.length < 2 ? [...prev, i] : prev
    );
  };

  return (
    <div className="mobile-container pb-28">
      <div className="px-5 pt-12 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">Our Services</h1>
          <p className="text-sm text-muted-foreground mt-1">Professional care for every sneaker</p>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {["All", "Popular", "Budget", "Premium"].map((filter, i) => (
            <button
              key={filter}
              className={`shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${i === 0 ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground hover:text-foreground"}`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {services.map((service, i) => {
            const Icon = service.icon;
            const isExpanded = expandedCard === i;
            return (
              <div
                key={service.name}
                className={`glass-card rounded-2xl overflow-hidden transition-all ${isExpanded ? "border-primary/30" : ""}`}
              >
                {service.popular && (
                  <div className="w-full py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                    ⭐ Most Popular
                  </div>
                )}
                <div className="p-5 space-y-4">
                  <div className={`w-full h-2 rounded-full bg-gradient-to-r ${service.color}`} />
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                          <Icon size={16} className="text-primary" />
                        </div>
                        <h3 className="font-display font-semibold text-base">{service.name}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed pr-4">{service.description}</p>
                      <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-primary fill-primary" />
                          <span className="text-xs font-medium">{service.rating}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">({service.reviews} reviews)</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-display font-bold gradient-text">{service.price}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{service.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => setExpandedCard(isExpanded ? null : i)}
                    className="w-full flex items-center justify-center gap-1 text-xs text-primary font-medium py-1 hover:underline"
                  >
                    {isExpanded ? "Hide details" : "What's included"}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div className="space-y-2 animate-fade-in pt-1 border-t border-border">
                      <p className="text-xs font-medium text-muted-foreground pt-2">Includes:</p>
                      {service.includes.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                          <Check size={14} className="text-primary shrink-0" />
                          <span className="text-xs">{item}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate("/booking")}
                      className="flex-1 gradient-btn py-3 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
                    >
                      Book Now
                      <ArrowRight size={16} />
                    </button>
                    <button
                      onClick={() => toggleCompare(i)}
                      className={`px-4 py-3 rounded-xl text-xs font-medium transition-all ${selectedCompare.includes(i) ? "bg-primary/20 text-primary border border-primary/30" : "glass-card text-muted-foreground"}`}
                    >
                      Compare
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compare Panel */}
        {selectedCompare.length === 2 && (
          <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in border-primary/20">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm">Comparison</h3>
              <button onClick={() => setSelectedCompare([])} className="text-xs text-primary font-medium">Clear</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {selectedCompare.map((idx) => (
                <div key={idx} className="space-y-2 text-center">
                  <p className="font-display font-semibold text-sm">{services[idx].name}</p>
                  <p className="text-xl font-display font-bold gradient-text">{services[idx].price}</p>
                  <p className="text-[10px] text-muted-foreground">{services[idx].time}</p>
                  <div className="text-left space-y-1 pt-2 border-t border-border">
                    {services[idx].includes.map((item) => (
                      <div key={item} className="flex items-start gap-1">
                        <Check size={10} className="text-primary mt-0.5 shrink-0" />
                        <span className="text-[10px]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Services;
