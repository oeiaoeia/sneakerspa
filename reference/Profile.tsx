import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, MapPin, Clock, Crown, HelpCircle, LogOut, ChevronRight, Bell, Shield, Palette, Edit3, Check, X, Sparkles, Award } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const Profile = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState("Alex Johnson");
  const [userEmail, setUserEmail] = useState("alex@email.com");
  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedAddress, setExpandedAddress] = useState<number | null>(null);

  const addresses = [
    { label: "Home", address: "123 Main Street, Apt 4B", city: "New York, NY 10001", isDefault: true },
    { label: "Office", address: "456 Business Ave, Floor 12", city: "New York, NY 10016", isDefault: false },
  ];

  const stats = [
    { label: "Total Orders", value: "12", icon: Sparkles },
    { label: "Member Since", value: "Jan '25", icon: Award },
    { label: "Points", value: "1,250", icon: Crown },
  ];

  const saveProfile = () => {
    setUserName(editName);
    setUserEmail(editEmail);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditName(userName);
    setEditEmail(userEmail);
    setIsEditing(false);
  };

  return (
    <div className="mobile-container pb-28">
      <div className="px-5 pt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-xs text-primary font-medium px-3 py-1.5 rounded-full glass-card hover:border-primary/30 transition-all"
            >
              <Edit3 size={12} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancelEdit} className="p-2 rounded-full glass-card text-muted-foreground hover:text-destructive transition-colors">
                <X size={14} />
              </button>
              <button onClick={saveProfile} className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                <Check size={14} />
              </button>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center relative">
            <User size={28} className="text-primary" />
            {isEditing && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center cursor-pointer">
                <Edit3 size={10} className="text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-secondary rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-secondary rounded-lg px-3 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ) : (
              <>
                <h2 className="font-display font-semibold text-lg">{userName}</h2>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Crown size={12} className="text-primary" />
                  <span className="text-xs text-primary font-medium">Premium Member</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card rounded-2xl p-3 text-center">
              <Icon size={16} className="text-primary mx-auto mb-1.5" />
              <p className="text-base font-display font-bold">{value}</p>
              <p className="text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Subscription */}
        <div className="glass-card rounded-2xl p-5 border-primary/20 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-display font-semibold text-sm">Monthly Plan</p>
              <p className="text-xs text-muted-foreground">Next billing: Apr 15, 2026</p>
            </div>
            <span className="text-lg font-display font-bold gradient-text">$29/mo</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
              <p className="text-lg font-display font-bold">1</p>
              <p className="text-[10px] text-muted-foreground">Cleanings Left</p>
            </div>
            <div className="flex-1 bg-secondary rounded-xl p-3 text-center">
              <p className="text-lg font-display font-bold">20%</p>
              <p className="text-[10px] text-muted-foreground">Discount</p>
            </div>
          </div>
          <button className="w-full glass-card py-2.5 rounded-xl text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
            Manage Subscription
          </button>
        </div>

        {/* Saved Addresses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-base">Saved Addresses</h2>
            <button className="text-xs text-primary font-medium">+ Add New</button>
          </div>
          {addresses.map((addr, i) => (
            <button
              key={i}
              onClick={() => setExpandedAddress(expandedAddress === i ? null : i)}
              className="w-full glass-card rounded-2xl p-4 text-left transition-all hover:border-primary/30 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-primary shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{addr.label}</span>
                    {addr.isDefault && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">Default</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{addr.address}</p>
                </div>
                <ChevronRight size={14} className={`text-muted-foreground transition-transform ${expandedAddress === i ? "rotate-90" : ""}`} />
              </div>
              {expandedAddress === i && (
                <div className="mt-3 pt-3 border-t border-border flex gap-2 animate-fade-in">
                  <span className="text-xs text-primary font-medium">Edit</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{addr.isDefault ? "Default address" : "Set as default"}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-destructive">Remove</span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Settings */}
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-border">
          {/* Toggles */}
          <div className="px-5 py-4 flex items-center gap-4">
            <Bell size={18} className="text-muted-foreground" />
            <span className="flex-1 text-sm">Notifications</span>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-11 h-6 rounded-full transition-all relative ${notifications ? "bg-primary" : "bg-secondary"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-all ${notifications ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
          <div className="px-5 py-4 flex items-center gap-4">
            <Palette size={18} className="text-muted-foreground" />
            <span className="flex-1 text-sm">Dark Mode</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-11 h-6 rounded-full transition-all relative ${darkMode ? "bg-primary" : "bg-secondary"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-all ${darkMode ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>

          {/* Links */}
          {[
            { icon: Clock, label: "Order History", onClick: () => navigate("/orders") },
            { icon: Shield, label: "Privacy & Security" },
            { icon: HelpCircle, label: "Help & Support" },
          ].map(({ icon: Icon, label, onClick }) => (
            <button key={label} onClick={onClick} className="w-full px-5 py-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors">
              <Icon size={18} className="text-muted-foreground" />
              <span className="flex-1 text-sm text-left">{label}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        <button className="w-full glass-card rounded-2xl py-4 flex items-center justify-center gap-2 text-destructive font-medium text-sm hover:bg-destructive/10 active:scale-[0.97] transition-all">
          <LogOut size={16} />
          Sign Out
        </button>

        <p className="text-center text-[10px] text-muted-foreground pb-4">Sneaker Spa v1.0 • Made with ❤️</p>
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
