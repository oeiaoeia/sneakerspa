import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Upload, MapPin, CreditCard, Sparkles, Clock, Camera, Shield, Star, Info } from "lucide-react";
import { toast } from "sonner";

const steps = ["Service", "Schedule", "Address", "Photos", "Payment"];

const services = [
  { name: "Basic Clean", price: "$25", time: "1-2 days", description: "Surface clean & deodorize", rating: 4.8 },
  { name: "Deep Clean", price: "$45", time: "2-3 days", description: "Full disassembly & restoration", rating: 4.9, popular: true },
  { name: "Premium Restoration", price: "$75", time: "3-5 days", description: "Complete restore & protect", rating: 5.0 },
  { name: "Suede Care", price: "$55", time: "2-4 days", description: "Specialized suede treatment", rating: 4.9 },
];

const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

const addons = [
  { name: "Express (24h)", price: "+$15", id: "express" },
  { name: "Protective Coating", price: "+$10", id: "coating" },
  { name: "Lace Swap (White)", price: "+$5", id: "laces" },
];

const Booking = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<number[]>([]);
  const [address, setAddress] = useState({ street: "", city: "", zip: "" });
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]);
  };

  const simulateUpload = (n: number) => {
    if (!uploadedPhotos.includes(n)) {
      setUploadedPhotos((prev) => [...prev, n]);
      toast.success(`Photo uploaded successfully`);
    }
  };

  const applyPromo = () => {
    if (promoCode.toLowerCase() === "clean20") {
      setPromoApplied(true);
      toast.success("Promo code applied! 20% off");
    } else {
      toast.error("Invalid promo code");
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return selectedService !== null;
    if (currentStep === 1) return selectedDate !== null && selectedTime !== null;
    if (currentStep === 2) return address.street.length > 0;
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.success("Order placed successfully! 🎉");
      setTimeout(() => navigate("/orders"), 1500);
    }
  };

  const getTotal = () => {
    let total = selectedService !== null ? parseInt(services[selectedService].price.replace("$", "")) : 0;
    if (selectedAddons.includes("express")) total += 15;
    if (selectedAddons.includes("coating")) total += 10;
    if (selectedAddons.includes("laces")) total += 5;
    if (promoApplied) total = Math.round(total * 0.8);
    return total;
  };

  return (
    <div className="mobile-container min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : navigate(-1)} className="w-10 h-10 rounded-xl glass-card flex items-center justify-center active:scale-90 transition-transform">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-display font-semibold text-lg">Book Cleaning</h1>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-2">
          {steps.map((_, i) => (
            <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-secondary">
              <div className={`h-full rounded-full transition-all duration-500 ${i <= currentStep ? "bg-primary w-full" : "w-0"}`} style={{ background: i <= currentStep ? "var(--gradient-primary)" : undefined }} />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {steps.length} — {steps[currentStep]}</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 overflow-y-auto pb-32">
        {currentStep === 0 && (
          <div className="space-y-3 animate-fade-in">
            <h2 className="font-display font-semibold text-base mb-4">Select a Service</h2>
            {services.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setSelectedService(i)}
                className={`w-full glass-card rounded-2xl p-4 flex items-center gap-4 transition-all text-left active:scale-[0.98] ${selectedService === i ? "border-primary/50 bg-primary/5" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedService === i ? "bg-primary/20" : "bg-secondary"}`}>
                  <Sparkles size={18} className={selectedService === i ? "text-primary" : "text-muted-foreground"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-semibold text-sm">{s.name}</p>
                    {s.popular && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">Popular</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1">
                      <Clock size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{s.time}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Star size={10} className="text-primary fill-primary" />
                      <span className="text-[10px] text-muted-foreground">{s.rating}</span>
                    </div>
                  </div>
                </div>
                <span className="font-display font-bold text-base gradient-text">{s.price}</span>
                {selectedService === i && <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check size={12} className="text-primary-foreground" /></div>}
              </button>
            ))}

            {/* Add-ons */}
            {selectedService !== null && (
              <div className="space-y-2 pt-4 animate-fade-in">
                <h3 className="font-display font-semibold text-sm">Add-ons</h3>
                {addons.map((addon) => (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={`w-full glass-card rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-[0.98] ${selectedAddons.includes(addon.id) ? "border-primary/50 bg-primary/5" : ""}`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selectedAddons.includes(addon.id) ? "border-primary bg-primary" : "border-muted-foreground"}`}>
                      {selectedAddons.includes(addon.id) && <Check size={10} className="text-primary-foreground" />}
                    </div>
                    <span className="text-sm flex-1">{addon.name}</span>
                    <span className="text-xs text-primary font-medium">{addon.price}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-display font-semibold text-base mb-4">Pick a Date</h2>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
                {dates.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(i)}
                    className={`shrink-0 w-16 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all snap-start active:scale-95 ${selectedDate === i ? "bg-primary/20 border border-primary/50" : "glass-card"}`}
                  >
                    <span className="text-[10px] text-muted-foreground uppercase">{d.toLocaleDateString("en", { weekday: "short" })}</span>
                    <span className="text-lg font-display font-bold">{d.getDate()}</span>
                    <span className="text-[10px] text-muted-foreground">{d.toLocaleDateString("en", { month: "short" })}</span>
                    {i === 0 && <span className="text-[8px] text-primary font-medium">Today</span>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-display font-semibold text-base mb-4">Pick a Time</h2>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={`py-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${selectedTime === t ? "bg-primary/20 border border-primary/50 text-primary" : "glass-card text-muted-foreground"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Notes */}
            <div>
              <h2 className="font-display font-semibold text-base mb-3">Special Instructions</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., ring doorbell, leave at door..."
                className="w-full bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20"
              />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="font-display font-semibold text-base mb-4">Pickup Address</h2>
            <div className="glass-card rounded-2xl p-4 space-y-4">
              <div className="w-full h-40 rounded-xl bg-secondary flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
                <MapPin size={32} className="text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Street address"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="City"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={address.zip}
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                  className="bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
            <button className="w-full glass-card rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 text-primary hover:bg-primary/10 active:scale-[0.97] transition-all">
              <MapPin size={16} /> Use Current Location
            </button>
            {/* Saved addresses */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Saved Addresses</p>
              {[{ label: "Home", address: "123 Main St" }, { label: "Office", address: "456 Business Ave" }].map((a) => (
                <button
                  key={a.label}
                  onClick={() => setAddress({ street: a.address, city: "New York", zip: "10001" })}
                  className="w-full glass-card rounded-xl p-3 flex items-center gap-3 text-left hover:border-primary/30 active:scale-[0.98] transition-all"
                >
                  <MapPin size={14} className="text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.address}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="font-display font-semibold text-base mb-2">Upload Sneaker Photos</h2>
            <div className="flex items-start gap-2 glass-card rounded-xl p-3">
              <Info size={14} className="text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">Photos help us assess condition and provide accurate pricing. At least 2 photos recommended.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { n: 1, label: "Front" },
                { n: 2, label: "Back" },
                { n: 3, label: "Sole" },
                { n: 4, label: "Side" },
              ].map(({ n, label }) => (
                <button
                  key={n}
                  onClick={() => simulateUpload(n)}
                  className={`aspect-square glass-card rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${uploadedPhotos.includes(n) ? "border-primary/50 bg-primary/5" : "hover:border-primary/30"}`}
                >
                  {uploadedPhotos.includes(n) ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check size={20} className="text-primary" />
                      </div>
                      <span className="text-[10px] text-primary font-medium">{label} ✓</span>
                    </>
                  ) : (
                    <>
                      <Camera size={24} className="text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{label}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">{uploadedPhotos.length}/4 photos uploaded</p>
            <button className="w-full glass-card rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 text-primary mt-2 hover:bg-primary/10 active:scale-[0.97] transition-all">
              <Upload size={16} /> Upload from Gallery
            </button>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="font-display font-semibold text-base mb-4">Payment Summary</h2>
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{selectedService !== null ? services[selectedService].name : ""}</span>
              </div>
              {selectedAddons.length > 0 && selectedAddons.map((id) => {
                const addon = addons.find((a) => a.id === id);
                return addon ? (
                  <div key={id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{addon.name}</span>
                    <span className="font-medium">{addon.price}</span>
                  </div>
                ) : null;
              })}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pickup Fee</span>
                <span className="font-medium text-primary">Free</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Promo (CLEAN20)</span>
                  <span className="font-medium text-primary">-20%</span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-display font-semibold">Total</span>
                <span className="font-display font-bold text-lg gradient-text">${getTotal()}</span>
              </div>
            </div>

            {/* Promo Code */}
            {!promoApplied && (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button onClick={applyPromo} className="px-4 py-3 glass-card rounded-xl text-sm font-medium text-primary hover:bg-primary/10 active:scale-[0.97] transition-all">
                  Apply
                </button>
              </div>
            )}

            {/* Payment Method */}
            <div className="glass-card rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <CreditCard size={18} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Visa</p>
              </div>
              <button className="text-xs text-primary font-medium hover:underline">Change</button>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <Shield size={14} className="text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">Secured by 256-bit SSL encryption</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-6 pt-4 bg-gradient-to-t from-background via-background to-background/0 z-40">
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full gradient-btn py-4 rounded-2xl font-display font-semibold text-base disabled:opacity-40 disabled:hover:transform-none disabled:hover:shadow-none active:scale-[0.97] transition-transform"
        >
          {currentStep === steps.length - 1 ? `Confirm & Pay $${getTotal()}` : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default Booking;
