import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Package, Phone, MessageCircle, Star, RotateCcw, ChevronDown, ChevronUp, MapPin, Clock, Image } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const trackingSteps = [
  { label: "Pickup Scheduled", time: "Today, 2:00 PM", done: true, detail: "Driver assigned: Mike R." },
  { label: "Picked Up", time: "Today, 2:15 PM", done: true, detail: "Shoes collected from your address" },
  { label: "Cleaning in Progress", time: "In progress", done: false, active: true, detail: "Currently being deep cleaned by our experts" },
  { label: "Quality Check", time: "Estimated: Tomorrow", done: false, detail: "Final inspection before delivery" },
  { label: "Out for Delivery", time: "Estimated: Tomorrow 4PM", done: false, detail: "Will be delivered to your address" },
];

const pastOrders = [
  { id: "SNK-2831", service: "Basic Clean", date: "Mar 15, 2026", status: "Delivered", rated: true, rating: 5, price: "$25" },
  { id: "SNK-2790", service: "Suede Care", date: "Feb 28, 2026", status: "Delivered", rated: false, rating: 0, price: "$55" },
  { id: "SNK-2745", service: "Deep Clean", date: "Feb 10, 2026", status: "Delivered", rated: true, rating: 4, price: "$45" },
];

const Orders = () => {
  const navigate = useNavigate();
  const [expandedStep, setExpandedStep] = useState<number | null>(2);
  const [showOrderDetail, setShowOrderDetail] = useState(true);
  const [ratingOrder, setRatingOrder] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [submittedRatings, setSubmittedRatings] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");

  const submitRating = (orderId: string, rating: number) => {
    setSubmittedRatings((prev) => ({ ...prev, [orderId]: rating }));
    setRatingOrder(null);
    setHoverRating(0);
  };

  return (
    <div className="mobile-container pb-28">
      <div className="px-5 pt-12 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold">My Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your sneaker's journey</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 glass-card rounded-xl">
          {(["active", "past"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
            >
              {tab === "active" ? "Active (1)" : "Past (3)"}
            </button>
          ))}
        </div>

        {activeTab === "active" && (
          <>
            {/* Active Order */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowOrderDetail(!showOrderDetail)}
                className="w-full p-5 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Package size={18} className="text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-display font-semibold text-sm">Deep Clean</p>
                  <p className="text-xs text-muted-foreground">Order #SNK-2847</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">In Progress</span>
                  {showOrderDetail ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>
              </button>

              {showOrderDetail && (
                <div className="px-5 pb-5 space-y-5 animate-fade-in">
                  {/* Order Info Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <Clock size={14} className="text-muted-foreground mx-auto mb-1" />
                      <p className="text-[10px] text-muted-foreground">ETA</p>
                      <p className="text-xs font-bold">Tomorrow</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <MapPin size={14} className="text-muted-foreground mx-auto mb-1" />
                      <p className="text-[10px] text-muted-foreground">Pickup</p>
                      <p className="text-xs font-bold">123 Main</p>
                    </div>
                    <div className="bg-secondary rounded-xl p-3 text-center">
                      <Image size={14} className="text-muted-foreground mx-auto mb-1" />
                      <p className="text-[10px] text-muted-foreground">Photos</p>
                      <p className="text-xs font-bold">3 uploaded</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                      <span>Progress</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: "45%", background: "var(--gradient-primary)" }}
                      />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-0">
                    {trackingSteps.map((step, i) => (
                      <button
                        key={step.label}
                        className="flex gap-4 w-full text-left"
                        onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                      >
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${step.done ? "bg-primary" : step.active ? "bg-primary/30 border-2 border-primary" : "bg-secondary"}`}>
                            {step.done && <Check size={12} className="text-primary-foreground" />}
                            {step.active && <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                          </div>
                          {i < trackingSteps.length - 1 && (
                            <div className={`w-0.5 ${expandedStep === i ? "h-16" : "h-10"} transition-all ${step.done ? "bg-primary/50" : "bg-secondary"}`} />
                          )}
                        </div>
                        <div className={`${i < trackingSteps.length - 1 ? "pb-4" : ""}`}>
                          <p className={`text-sm font-medium ${step.done || step.active ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                          <p className={`text-xs mt-0.5 ${step.active ? "text-primary" : "text-muted-foreground"}`}>{step.time}</p>
                          {expandedStep === i && (
                            <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed animate-fade-in">{step.detail}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Contact Driver */}
                  <div className="flex gap-2">
                    <button className="flex-1 glass-card rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium hover:border-primary/30 active:scale-[0.97] transition-all">
                      <Phone size={16} className="text-primary" />
                      Call Driver
                    </button>
                    <button className="flex-1 glass-card rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium hover:border-primary/30 active:scale-[0.97] transition-all">
                      <MessageCircle size={16} className="text-primary" />
                      Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "past" && (
          <div className="space-y-3">
            {pastOrders.map((order) => (
              <div key={order.id} className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Check size={18} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{order.service}</p>
                    <p className="text-xs text-muted-foreground">{order.id} • {order.date}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-display font-bold gradient-text">{order.price}</span>
                    <p className="text-[10px] text-primary font-medium">{order.status}</p>
                  </div>
                </div>

                {/* Rating */}
                {ratingOrder === order.id ? (
                  <div className="flex items-center gap-3 animate-fade-in">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => submitRating(order.id, star)}
                          className="p-0.5"
                        >
                          <Star
                            size={20}
                            className={`transition-colors ${star <= hoverRating ? "text-primary fill-primary" : "text-muted-foreground"}`}
                          />
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setRatingOrder(null)} className="text-xs text-muted-foreground">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {(submittedRatings[order.id] || order.rated) ? (
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            className={`${star <= (submittedRatings[order.id] || order.rating) ? "text-primary fill-primary" : "text-muted-foreground"}`}
                          />
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => setRatingOrder(order.id)}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        Rate this order
                      </button>
                    )}
                    <div className="flex-1" />
                    <button
                      onClick={() => navigate("/booking")}
                      className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                    >
                      <RotateCcw size={12} />
                      Reorder
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Orders;
