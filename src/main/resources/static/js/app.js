// ============================================================================
// Sneaker Spa — Mobile-First Single Page Application
// Recreates React prototype from /reference exactly as plain HTML/CSS/JS
// ============================================================================

// Global application state
const state = {
  currentRoute: window.location.hash.slice(1) || "/",
  currentUser: null,
  activeOrderCount: 0,
  services: [],
  addOns: [],
  reviews: [],
  onboardingSlide: 0,
  activeFilter: "All",
  expandedServiceCards: {},
  selectedCompareServices: [],
  booking: {
    currentStep: 0,
    selectedServiceIds: [],
    selectedAddonIds: [],
    selectedDateIndex: 0,
    selectedTimeSlot: "2:00 PM",
    address: { street: "", city: "New York", zip: "10001" },
    instructions: "",
    promoCode: "",
    promoApplied: false,
    promoDiscount: 0,
    uploadedPhotos: [], // Array of { slotNumber, slotLabel, photoUrl, originalFilename, fileSize }
    calculatedTotal: 0,
    calculatedSubtotal: 0,
  },
  orders: {
    activeTab: "active",
    expandedStepIndex: 2,
    showActiveDetail: true,
    ratingOrderId: null,
    hoverRating: 0,
    activeOrders: [],
    pastOrders: [],
  },
  profile: {
    isEditing: false,
    editName: "",
    editEmail: "",
    data: null,
    addresses: [],
    expandedAddressId: null,
  },
  home: {
    likedReviews: {},
    activeTransformationIndex: 0,
  },
  admin: {
    activeTab: "orders", // "orders" | "reviews" | "support"
    searchQuery: "",
    statusFilter: "ALL",
    viewingPhotoOrderId: null,
    featuredReviews: { 1: true, 2: true },
    adminReplies: {
      1: "Thank you for trusting us with your Travis Scott 1s! Suede revival and sole de-yellowing are our specialties.",
    },
    supportTickets: [
      {
        id: "TCK-401",
        customer: "Alex Johnson",
        email: "alex@email.com",
        orderId: "SNK-94821",
        issue: "Requesting pickup time window adjustment to 4:00 PM - 5:00 PM due to client meeting.",
        priority: "HIGH",
        status: "OPEN",
        time: "10 mins ago",
      },
      {
        id: "TCK-402",
        customer: "Marcus Vance",
        email: "marcus@vance.com",
        orderId: "SNK-88219",
        issue: "Special care note: Vintage buttery suede on Jordan 1 Chicago 1985 requires chemical-free conditioning.",
        priority: "MEDIUM",
        status: "OPEN",
        time: "25 mins ago",
      },
      {
        id: "TCK-398",
        customer: "Elena Rostova",
        email: "elena@rostova.com",
        orderId: "SNK-77102",
        issue: "Doorman building delivery instructions: Package locker access code #8821.",
        priority: "LOW",
        status: "RESOLVED",
        time: "2 hours ago",
      },
    ],
    drivers: [
      {
        id: "DRV-1",
        name: "Mike Ramirez",
        vehicle: "Ford Transit Van #102",
        zone: "Manhattan (Downtown & SoHo)",
        status: "ON_ROUTE",
        activeStops: 4,
        completedToday: 9,
        etaNext: "14 mins",
        phone: "+1 (555) 234-5678",
      },
      {
        id: "DRV-2",
        name: "Sarah Jenkins",
        vehicle: "Mercedes Sprinter #105",
        zone: "Brooklyn (Williamsburg & DUMBO)",
        status: "ON_ROUTE",
        activeStops: 3,
        completedToday: 11,
        etaNext: "8 mins",
        phone: "+1 (555) 876-5432",
      },
      {
        id: "DRV-3",
        name: "David Kim",
        vehicle: "Cargo E-Bike Fleet #02",
        zone: "Midtown Express & Rush Dispatch",
        status: "AVAILABLE",
        activeStops: 0,
        completedToday: 7,
        etaNext: "At Central Hub",
        phone: "+1 (555) 345-6789",
      },
    ],
  },
  showAuthModal: false,
  authModalTab: "login",
};

// Lucide icon helper
function renderIcon(name, className = "text-primary", size = 20) {
  return `<i data-lucide="${name}" class="${className}" style="width:${size}px;height:${size}px;display:inline-block;vertical-align:middle;"></i>`;
}

// Toast notification system (Sonner style)
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const isSuccess = type === "success";
  toast.className = `glass-card pointer-events-auto p-4 rounded-xl flex items-center gap-3 shadow-lg border border-${isSuccess ? "primary/40" : "destructive/40"} animate-fade-in transition-all`;
  toast.innerHTML = `
    <div class="w-7 h-7 rounded-lg ${isSuccess ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"} flex items-center justify-center shrink-0">
      ${isSuccess ? renderIcon("check", "text-primary", 16) : renderIcon("alert-circle", "text-destructive", 16)}
    </div>
    <span class="text-xs font-medium text-foreground">${message}</span>
  `;

  container.appendChild(toast);
  lucide.createIcons({ root: toast });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ============================================================================
// DATA FETCHERS & INITIALIZATION
// ============================================================================

async function initAppData() {
  try {
    const [services, addOns, reviews] = await Promise.all([
      API.getServices().catch(() => []),
      API.getAddOns().catch(() => []),
      API.getReviews().catch(() => []),
    ]);
    state.services = services;
    state.addOns = addOns;
    state.reviews = reviews;

    // Auto-authenticate with demo user credentials if no session exists
    if (!API.isAuthenticated()) {
      try {
        const res = await API.login("alex@email.com", "password123");
        state.currentUser = { id: res.id, name: res.name, email: res.email, role: res.role };
      } catch (e) {
        console.warn("Demo auto-login failed:", e);
      }
    } else {
      state.currentUser = API.getUser();
    }

    if (API.isAuthenticated()) {
      await fetchUserData();
    }
  } catch (err) {
    console.error("Initialization error:", err);
  }
}

async function fetchUserData() {
  if (!API.isAuthenticated()) return;
  try {
    const [profile, activeOrders, pastOrders, addresses] = await Promise.all([
      API.getProfile().catch(() => null),
      API.getActiveOrders().catch(() => []),
      API.getPastOrders().catch(() => []),
      API.getAddresses().catch(() => []),
    ]);

    if (profile) {
      state.profile.data = profile;
      state.currentUser = { id: profile.id, name: profile.name, email: profile.email, role: profile.role };
      API.setUser(state.currentUser);
    }
    state.orders.activeOrders = activeOrders;
    state.orders.pastOrders = pastOrders;
    state.activeOrderCount = activeOrders.length;
    state.profile.addresses = addresses;

    // Set default address in booking if available
    const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
    if (defaultAddr && !state.booking.address.street) {
      state.booking.address = {
        street: defaultAddr.street,
        city: defaultAddr.city,
        zip: defaultAddr.zip,
      };
    }
  } catch (err) {
    console.error("Failed to fetch user data:", err);
  }
}

// ============================================================================
// ROUTING
// ============================================================================

function navigate(route) {
  window.location.hash = route;
}

window.addEventListener("hashchange", () => {
  state.currentRoute = window.location.hash.slice(1) || "/";
  render();
});

window.addEventListener("auth-changed", async (e) => {
  if (e.detail.authenticated) {
    if (e.detail.user) {
      state.currentUser = e.detail.user;
    }
    await fetchUserData();
  } else {
    state.currentUser = null;
    state.profile.data = null;
    state.orders.activeOrders = [];
    state.orders.pastOrders = [];
    state.activeOrderCount = 0;
  }
  render();
});

// ============================================================================
// BOTTOM & SIDEBAR NAVIGATION COMPONENTS
// ============================================================================

function renderBottomNav() {
  const user = API.getUser() || state.currentUser;
  const isAdmin = user && user.role === "ADMIN";

  const customerTabs = [
    { icon: "home", label: "Home", path: "/home", onclick: "navigate('/home')" },
    { icon: "sparkles", label: "Services", path: "/services", onclick: "navigate('/services')" },
    { icon: "package", label: "Orders", path: "/orders", onclick: "navigate('/orders')" },
    { icon: "user", label: "Profile", path: "/profile", onclick: "navigate('/profile')" },
  ];

  const adminTabs = [
    { icon: "clipboard-list", label: "Orders", path: "/admin", tab: "orders", onclick: "setAdminTab('orders')" },
    { icon: "star", label: "Reviews", path: "/admin", tab: "reviews", onclick: "setAdminTab('reviews')" },
    { icon: "truck", label: "Support", path: "/admin", tab: "support", onclick: "setAdminTab('support')" },
    { icon: "user", label: "Profile", path: "/profile", tab: null, onclick: "navigate('/profile')" },
  ];

  const tabs = isAdmin ? adminTabs : customerTabs;

  return `
    <!-- Floating Bottom Navigation (Mobile < 768px only) -->
    <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 md:hidden">
      <div class="glass-card mx-4 mb-4 rounded-2xl px-2 py-3 flex justify-around items-center">
        ${tabs
          .map((item) => {
            let active = false;
            if (isAdmin) {
              if (item.path === "/admin") {
                active = state.currentRoute === "/admin" && state.admin.activeTab === item.tab;
              } else {
                active = state.currentRoute === item.path;
              }
            } else {
              active = state.currentRoute === item.path;
            }

            return `
              <button
                onclick="${item.onclick}"
                class="flex flex-col items-center gap-1 transition-all duration-200"
              >
                <div class="p-2 rounded-xl transition-all duration-200 ${active ? "bg-primary/20" : ""}">
                  ${renderIcon(item.icon, `transition-colors ${active ? "text-primary" : "text-muted-foreground"}`, 20)}
                </div>
                <span class="text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}">
                  ${item.label}
                </span>
              </button>
            `;
          })
          .join("")}
      </div>
    </nav>

    <!-- Desktop Sidebar Navigation (>= 768px only) -->
    ${renderSidebar()}
  `;
}

function renderSidebar() {
  const currentRoute = state.currentRoute;
  if (currentRoute === "/" || currentRoute === "") {
    return ""; // No sidebar on Onboarding
  }

  const user = API.getUser() || state.currentUser;
  const isAdmin = user && user.role === "ADMIN";

  const customerTabs = [
    { icon: "home", label: "Home", path: "/home", onclick: "navigate('/home')" },
    { icon: "sparkles", label: "Services", path: "/services", onclick: "navigate('/services')" },
    { icon: "package", label: "Orders", path: "/orders", onclick: "navigate('/orders')" },
    { icon: "user", label: "Profile", path: "/profile", onclick: "navigate('/profile')" },
  ];

  const adminTabs = [
    { icon: "clipboard-list", label: "Live Orders", path: "/admin", tab: "orders", onclick: "setAdminTab('orders')" },
    { icon: "star", label: "Customer Reviews", path: "/admin", tab: "reviews", onclick: "setAdminTab('reviews')" },
    { icon: "truck", label: "Support & Dispatch", path: "/admin", tab: "support", onclick: "setAdminTab('support')" },
    { icon: "user", label: "Staff Profile", path: "/profile", tab: null, onclick: "navigate('/profile')" },
  ];

  const tabs = isAdmin ? adminTabs : customerTabs;

  return `
    <aside class="hidden md:flex fixed inset-y-0 left-0 w-[260px] h-screen glass-card border-r border-border/80 flex-col justify-between z-40 p-5 select-none bg-background/90 backdrop-blur-xl">
      <!-- Top: Logo & Nav -->
      <div>
        <div class="flex items-center gap-3 mb-8 cursor-pointer group" onclick="navigate('${isAdmin ? "/admin" : "/home"}')">
          <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary/30 transition-colors shadow-sm shadow-primary/20">
            ${renderIcon(isAdmin ? "shield-check" : "sparkles", "text-primary", 20)}
          </div>
          <div class="flex flex-col">
            <span class="font-display font-bold text-lg tracking-tight gradient-text leading-tight">Sneaker Spa</span>
            <span class="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">${isAdmin ? "Operations Hub" : "Premium Care"}</span>
          </div>
        </div>

        <nav class="space-y-1.5">
          ${tabs
            .map((item) => {
              let active = false;
              if (isAdmin) {
                if (item.path === "/admin") {
                  active = currentRoute === "/admin" && state.admin.activeTab === item.tab;
                } else {
                  active = currentRoute === item.path;
                }
              } else {
                active = currentRoute === item.path;
              }

              let badgeHtml = "";
              if (!isAdmin && item.label === "Orders" && state.activeOrderCount > 0) {
                badgeHtml = `
                  <span class="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    ${state.activeOrderCount}
                  </span>
                `;
              } else if (isAdmin && item.tab === "orders" && adminOrdersList.length > 0) {
                const activeCount = adminOrdersList.filter(o => !["DELIVERED", "CANCELLED"].includes(o.rawStatus)).length;
                badgeHtml = `
                  <span class="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                    ${activeCount}
                  </span>
                `;
              } else if (isAdmin && item.tab === "reviews") {
                badgeHtml = `
                  <span class="text-[10px] font-bold text-amber-400">
                    4.9★
                  </span>
                `;
              } else if (isAdmin && item.tab === "support") {
                const openCount = state.admin.supportTickets.filter(t => t.status === "OPEN").length;
                if (openCount > 0) {
                  badgeHtml = `
                    <span class="w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                      ${openCount}
                    </span>
                  `;
                }
              }

              return `
              <button
                onclick="${item.onclick}"
                class="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/20 text-primary font-semibold shadow-sm shadow-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }"
              >
                ${renderIcon(item.icon, active ? "text-primary" : "text-muted-foreground", 18)}
                <span class="flex-1 text-left">${item.label}</span>
                ${badgeHtml}
              </button>
            `;
            })
            .join("")}

          ${
            !isAdmin
              ? `
            <!-- Book Cleaning primary button under nav items for Customers -->
            <div class="pt-4">
              <button
                onclick="navigate('/booking')"
                class="w-full gradient-btn py-3.5 px-4 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md shadow-primary/20 hover:shadow-primary/30"
              >
                ${renderIcon("sparkles", "text-primary-foreground", 16)}
                <span>Book Cleaning</span>
              </button>
            </div>
          `
              : `
            <!-- Operations Status & Storefront Preview for Admins (No consumer buying buttons) -->
            <div class="pt-4 space-y-2">
              <div class="glass-card p-3 rounded-xl border border-primary/20 bg-primary/5 text-center">
                <div class="flex items-center justify-center gap-2 text-xs font-semibold text-primary">
                  <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Operations Hub Live</span>
                </div>
                <p class="text-[10px] text-muted-foreground mt-0.5">Neon DB • Render Cloud</p>
              </div>
              <button
                onclick="navigate('/home')"
                class="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors py-2 px-3 rounded-xl hover:bg-secondary/60 border border-border/40"
              >
                ${renderIcon("external-link", "text-muted-foreground", 13)}
                <span>View Customer Store</span>
              </button>
            </div>
          `
          }
        </nav>
      </div>

      <!-- Bottom: User Card -->
      <div class="pt-4 border-t border-border/60 space-y-2">
        ${
          user
            ? `
          <div onclick="navigate('/profile')" class="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors group">
            <div class="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-primary/30 transition-colors">
              ${user.name ? user.name.charAt(0).toUpperCase() : (isAdmin ? "A" : "U")}
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold truncate leading-tight group-hover:text-primary transition-colors">${user.name || (isAdmin ? "Administrator" : "Customer")}</p>
              <p class="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                ${isAdmin ? "Staff • Super Admin" : `${state.profile && state.profile.loyaltyPoints ? state.profile.loyaltyPoints.toLocaleString() : (user.loyaltyPoints ? user.loyaltyPoints.toLocaleString() : "1,250")} pts`}
              </p>
            </div>
            ${renderIcon("chevron-right", "text-muted-foreground/60 group-hover:text-foreground transition-colors shrink-0", 14)}
          </div>
        `
            : `
          <button onclick="openAuthModal('login')" class="w-full glass-card py-2.5 px-3 rounded-xl text-xs font-medium text-center text-primary hover:bg-primary/10 transition-all">
            Sign In
          </button>
        `
        }
      </div>
    </aside>
  `;
}

// Sparkle SVG component from Onboarding.tsx
const sparkleSvg = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 0L9.79 6.21L16 8L9.79 9.79L8 16L6.21 9.79L0 8L6.21 6.21L8 0Z" fill="hsl(192, 100%, 50%)" />
  </svg>
`;

// ============================================================================
// SCREEN 1: ONBOARDING (#/)
// ============================================================================

const onboardingSlides = [
  {
    title: "Revive Your",
    highlight: "Sneakers",
    description: "Professional cleaning, restoration & care. Picked up from your door, returned like new.",
    icon: "sparkles",
  },
  {
    title: "Free Door-to-Door",
    highlight: "Pickup",
    description: "We come to you. Schedule a pickup and we'll handle the rest — no hassle, no waiting.",
    icon: "truck",
  },
  {
    title: "Expert Care &",
    highlight: "Protection",
    description: "Certified technicians with premium products. Your sneakers are insured and tracked.",
    icon: "shield",
  },
];

function renderOnboarding() {
  const currentSlide = state.onboardingSlide;
  const slide = onboardingSlides[currentSlide];

  return `
    <div class="min-h-screen w-full flex flex-col md:flex-row overflow-hidden bg-background">
      <!-- Hero Image (Top on mobile, Left half on desktop) -->
      <div class="relative w-full md:w-1/2 min-h-[340px] md:min-h-screen flex items-center justify-center overflow-hidden shrink-0">
        <div class="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background md:bg-gradient-to-r md:from-transparent md:to-background z-10"></div>
        <img
          src="/images/hero-sneaker.jpg"
          alt="Premium sneaker"
          class="w-full h-full object-cover absolute inset-0"
          width="800"
          height="1200"
        />
        <!-- Brand -->
        <div class="relative z-20 text-center mt-12 md:mt-0">
          <div class="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6">
            ${sparkleSvg}
            <span class="text-sm font-medium text-foreground/80">Premium Sneaker Care</span>
          </div>
        </div>
      </div>

      <!-- Slide Content (Bottom on mobile, Right half on desktop) -->
      <div class="relative z-20 flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-16 pb-10 pt-4 md:py-16 space-y-6 max-w-md md:max-w-xl mx-auto w-full">
        <div class="space-y-3" id="onboarding-slide-content">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              ${renderIcon(slide.icon, "text-primary", 16)}
            </div>
          </div>
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold font-display tracking-tight animate-fade-in">
            ${slide.title} <span class="gradient-text">${slide.highlight}</span>
          </h1>
          <p class="text-muted-foreground text-sm md:text-base leading-relaxed animate-fade-in" style="animation-delay: 0.1s">
            ${slide.description}
          </p>
        </div>

        <!-- Stats -->
        <div class="flex gap-4 animate-fade-in" style="animation-delay: 0.2s">
          <div class="flex-1 glass-card rounded-xl p-3 md:p-4 text-center">
            <p class="text-sm md:text-base font-display font-bold gradient-text">10K+</p>
            <p class="text-[10px] md:text-xs text-muted-foreground">Pairs Cleaned</p>
          </div>
          <div class="flex-1 glass-card rounded-xl p-3 md:p-4 text-center">
            <p class="text-sm md:text-base font-display font-bold gradient-text">4.9★</p>
            <p class="text-[10px] md:text-xs text-muted-foreground">Rating</p>
          </div>
          <div class="flex-1 glass-card rounded-xl p-3 md:p-4 text-center">
            <p class="text-sm md:text-base font-display font-bold gradient-text">Free</p>
            <p class="text-[10px] md:text-xs text-muted-foreground">Pickup</p>
          </div>
        </div>

        <!-- Dots -->
        <div class="flex justify-center md:justify-start gap-2">
          ${onboardingSlides
            .map(
              (_, i) => `
            <button
              onclick="setOnboardingSlide(${i})"
              class="h-2 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-primary" : "w-2 bg-secondary"}"
            ></button>
          `
            )
            .join("")}
        </div>

        <div class="flex gap-3 pt-2">
          <button
            onclick="nextOnboardingSlide()"
            class="flex-1 gradient-btn py-4 rounded-2xl font-display font-semibold text-base active:scale-[0.97] transition-transform"
          >
            ${currentSlide === onboardingSlides.length - 1 ? "Get Started" : "Next"}
          </button>

          ${
            currentSlide < onboardingSlides.length - 1
              ? `
            <button
              onclick="handleOnboardingSkip()"
              class="flex-1 glass-card py-4 rounded-2xl font-display font-semibold text-base text-foreground hover:bg-secondary active:scale-[0.97] transition-all"
            >
              Skip
            </button>
          `
              : `
            <button
              onclick="openAuthModal('login')"
              class="flex-1 glass-card py-4 rounded-2xl font-display font-semibold text-base text-foreground hover:bg-secondary active:scale-[0.97] transition-all"
            >
              Login
            </button>
          `
          }
        </div>
      </div>
    </div>
  `;
}

function setOnboardingSlide(index) {
  state.onboardingSlide = index;
  render();
}

function nextOnboardingSlide() {
  if (state.onboardingSlide < onboardingSlides.length - 1) {
    state.onboardingSlide++;
    render();
  } else {
    handleOnboardingSkip();
  }
}

function handleOnboardingSkip() {
  if (API.isAuthenticated()) {
    navigate("/home");
  } else {
    openAuthModal("login");
  }
}

// ============================================================================
// SCREEN 2: HOME (#/home)
// ============================================================================

function renderHome() {
  const user = state.currentUser || { name: "Alex Johnson" };
  const firstName = user.name.split(" ")[0];
  const userInitial = firstName.charAt(0).toUpperCase();

  const points = state.profile.data ? state.profile.data.loyaltyPoints : 1250;
  const activeCount = state.activeOrderCount || 1;

  // Real recent activity derived from active/past orders or fallback
  let recentOrders = state.orders.activeOrders.concat(state.orders.pastOrders).slice(0, 2);
  const recentActivity = recentOrders.length > 0 ? recentOrders.map(o => ({
    label: o.status === "Delivered" ? `${o.service} completed` : `Pickup scheduled`,
    detail: o.service || "Nike Air Max 90",
    time: o.date || "Today",
    status: o.status === "Delivered" ? "done" : "upcoming"
  })) : [
    { label: "Deep Clean completed", detail: "Nike Air Max 90", time: "2 days ago", status: "done" },
    { label: "Pickup scheduled", detail: "Adidas Ultraboost", time: "Tomorrow, 2PM", status: "upcoming" }
  ];

  const transformations = [
    { title: "Deep Clean Restoration", subtitle: "White sneaker • 3 days", image: "/images/before-after.jpg" },
    { title: "Expert Care Process", subtitle: "Hand-cleaned by certified technicians", image: "/images/cleaning-process.jpg" },
  ];
  const currentTrans = transformations[state.home.activeTransformationIndex];

  const reviewsList = state.reviews.length > 0 ? state.reviews : [
    { id: 1, name: "Sarah M.", rating: 5, text: "My Air Jordans look brand new! Incredible service.", time: "2 days ago", avatar: "S" },
    { id: 2, name: "James K.", rating: 5, text: "Fast pickup, perfect cleaning. Will use again!", time: "5 days ago", avatar: "J" },
    { id: 3, name: "Maria L.", rating: 5, text: "The suede care saved my favorite boots. Thank you!", time: "1 week ago", avatar: "M" },
  ];

  return `
    <div class="w-full min-h-screen md:pl-[260px] pb-28 md:pb-12">
      <div class="max-w-md md:max-w-[1100px] mx-auto px-5 md:px-8 pt-8 md:pt-10 space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-start">
          <div>
            <p class="text-muted-foreground text-sm">Good morning</p>
            <h1 class="text-2xl md:text-3xl font-display font-bold mt-1">Hey ${firstName} 👋</h1>
          </div>
          <div class="flex items-center gap-3">
            <button
              onclick="showToast('You have 2 cleaning vouchers available!', 'success')"
              class="relative w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              ${renderIcon("gift", "text-muted-foreground", 18)}
              <span class="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">2</span>
            </button>
            <button
              onclick="navigate('/profile')"
              class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
            >
              <span class="text-sm font-semibold text-primary">${userInitial}</span>
            </button>
          </div>
        </div>

        <!-- Top Row: Loyalty Points & Promo Banner (Side-by-side on desktop) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <!-- Loyalty Points -->
          <div class="glass-card rounded-2xl p-4 flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/10 flex items-center justify-center shrink-0">
              ${renderIcon("zap", "text-primary", 22)}
            </div>
            <div class="flex-1">
              <p class="text-xs text-muted-foreground">Loyalty Points</p>
              <p class="font-display font-bold text-lg gradient-text">${points.toLocaleString()} pts</p>
            </div>
            <div class="text-right">
              <p class="text-[10px] text-muted-foreground">Next reward</p>
              <div class="flex items-center gap-1 mt-0.5">
                <div class="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div class="h-full w-3/4 rounded-full" style="background: var(--gradient-primary)"></div>
                </div>
                <span class="text-[10px] text-primary font-medium">75%</span>
              </div>
            </div>
          </div>

          <!-- Promo Banner -->
          <button
            onclick="navigate('/booking')"
            class="w-full glass-card rounded-2xl p-4 lg:p-5 flex items-center gap-4 group transition-all hover:border-primary/30 active:scale-[0.98]"
          >
            <div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              ${renderIcon("truck", "text-primary", 22)}
            </div>
            <div class="text-left flex-1">
              <p class="font-display font-semibold text-sm">Free Pickup Today</p>
              <p class="text-xs text-muted-foreground mt-0.5">Book before 2 PM for same-day pickup</p>
            </div>
            ${renderIcon("arrow-right", "text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all", 18)}
          </button>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-3 gap-3 md:gap-4">
          <button
            onclick="navigate('/booking')"
            class="glass-card rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-primary/30 active:scale-[0.96] transition-all group relative"
          >
            <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              ${renderIcon("sparkles", "text-primary", 20)}
            </div>
            <span class="text-xs font-medium text-center whitespace-pre-line leading-tight">Book<br/>Cleaning</span>
          </button>

          <button
            onclick="navigate('/orders')"
            class="glass-card rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-primary/30 active:scale-[0.96] transition-all group relative"
          >
            ${activeCount > 0 ? `<span class="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">${activeCount}</span>` : ""}
            <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              ${renderIcon("clipboard-list", "text-primary", 20)}
            </div>
            <span class="text-xs font-medium text-center whitespace-pre-line leading-tight">Track<br/>Order</span>
          </button>

          <button
            onclick="navigate('/services')"
            class="glass-card rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-primary/30 active:scale-[0.96] transition-all group relative"
          >
            <div class="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              ${renderIcon("crown", "text-primary", 20)}
            </div>
            <span class="text-xs font-medium text-center whitespace-pre-line leading-tight">View<br/>Services</span>
          </button>
        </div>

        <!-- Main Home Grid: Left 2 Cols (Activity, Trans, Reviews) | Right Col (Subscription) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div class="lg:col-span-2 space-y-6">
            <!-- Recent Activity & Transformations side by side on desktop -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <!-- Recent Activity -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h2 class="font-display font-semibold text-lg">Recent Activity</h2>
                  <button onclick="navigate('/orders')" class="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                    View All ${renderIcon("chevron-right", "text-primary", 14)}
                  </button>
                </div>
                ${recentActivity
                  .map(
                    (item) => `
                  <button
                    onclick="navigate('/orders')"
                    class="w-full glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-primary/30 active:scale-[0.98] transition-all text-left"
                  >
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.status === "done" ? "bg-primary/20" : "bg-accent/10"}">
                      ${item.status === "done" ? renderIcon("sparkles", "text-primary", 18) : renderIcon("truck", "text-accent", 18)}
                    </div>
                    <div class="text-left flex-1 min-w-0">
                      <p class="text-sm font-medium truncate">${item.label}</p>
                      <p class="text-xs text-muted-foreground truncate">${item.detail}</p>
                    </div>
                    <div class="text-right shrink-0">
                      <span class="text-[10px] font-medium px-2 py-1 rounded-full ${item.status === "done" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}">
                        ${item.status === "done" ? "Completed" : "Upcoming"}
                      </span>
                      <p class="text-[10px] text-muted-foreground mt-1">${item.time}</p>
                    </div>
                  </button>
                `
                  )
                  .join("")}
              </div>

              <!-- Transformations Carousel -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h2 class="font-display font-semibold text-lg">Transformations</h2>
                  <div class="flex gap-1.5">
                    ${transformations
                      .map(
                        (_, i) => `
                      <button
                        onclick="setTransformation(${i})"
                        class="w-2 h-2 rounded-full transition-all ${i === state.home.activeTransformationIndex ? "bg-primary w-6" : "bg-secondary"}"
                      ></button>
                    `
                      )
                      .join("")}
                  </div>
                </div>
                <div
                  class="rounded-2xl overflow-hidden relative group cursor-pointer active:scale-[0.98] transition-transform"
                  onclick="cycleTransformation()"
                >
                  <img
                    src="${currentTrans.image}"
                    alt="Sneaker transformation"
                    class="w-full h-48 md:h-52 object-cover transition-opacity duration-500"
                    loading="lazy"
                    width="800"
                    height="512"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                  <div class="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <p class="text-sm font-display font-semibold">${currentTrans.title}</p>
                      <p class="text-xs text-muted-foreground">${currentTrans.subtitle}</p>
                    </div>
                    <div class="flex items-center gap-1 bg-primary/20 px-2 py-1 rounded-full">
                      ${renderIcon("trending-up", "text-primary", 12)}
                      <span class="text-[10px] text-primary font-medium">98% match</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer Reviews (Grid on desktop instead of horizontal scroll) -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h2 class="font-display font-semibold text-lg">Customer Reviews</h2>
                <div class="flex items-center gap-1">
                  ${renderIcon("star", "text-primary fill-primary", 14)}
                  <span class="text-sm font-display font-bold">4.9</span>
                  <span class="text-xs text-muted-foreground">(2.4K)</span>
                </div>
              </div>
              <div class="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:mx-0 md:px-0 md:overflow-visible">
                ${reviewsList
                  .map(
                    (review, i) => `
                  <div class="glass-card rounded-2xl p-4 min-w-[260px] md:min-w-0 shrink-0 snap-start space-y-3 flex flex-col justify-between">
                    <div class="space-y-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <span class="text-xs font-bold text-primary">${review.avatar || review.name[0]}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium truncate">${review.name}</p>
                          <div class="flex gap-0.5">
                            ${Array.from({ length: review.rating || 5 })
                              .map(() => renderIcon("star", "text-primary fill-primary", 10))
                              .join("")}
                          </div>
                        </div>
                        <span class="text-[10px] text-muted-foreground shrink-0">${review.time || review.timeAgo || "Recently"}</span>
                      </div>
                      <p class="text-xs text-muted-foreground leading-relaxed">${review.text}</p>
                    </div>
                    <button
                      onclick="toggleReviewLike(${review.id || i})"
                      class="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors pt-2 border-t border-border/50"
                    >
                      ${renderIcon("heart", state.home.likedReviews[review.id || i] ? "fill-primary text-primary" : "text-muted-foreground", 14)}
                      Helpful
                    </button>
                  </div>
                `
                  )
                  .join("")}
              </div>
            </div>
          </div>

          <!-- Subscription Card (Side Column on Desktop) -->
          <div class="lg:col-span-1">
            <div class="glass-card rounded-2xl p-5 border-primary/20 space-y-4 lg:sticky lg:top-8">
              <div class="flex items-center gap-2">
                ${renderIcon("crown", "text-primary", 18)}
                <span class="font-display font-semibold text-sm">Monthly Cleaning Plan</span>
                <span class="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium ml-auto">Save 40%</span>
              </div>
              <p class="text-xs text-muted-foreground leading-relaxed">
                Get 2 cleanings per month, priority pickup, and 20% off restoration services.
              </p>
              <div class="flex items-center gap-2">
                <div class="flex-1 bg-secondary rounded-xl p-3 text-center">
                  <p class="text-sm font-display font-bold">2</p>
                  <p class="text-[10px] text-muted-foreground">Cleanings/mo</p>
                </div>
                <div class="flex-1 bg-secondary rounded-xl p-3 text-center">
                  <p class="text-sm font-display font-bold">Priority</p>
                  <p class="text-[10px] text-muted-foreground">Pickup</p>
                </div>
                <div class="flex-1 bg-secondary rounded-xl p-3 text-center">
                  <p class="text-sm font-display font-bold">20%</p>
                  <p class="text-[10px] text-muted-foreground">Discount</p>
                </div>
              </div>
              <div class="flex items-end gap-1 pt-1">
                <span class="text-2xl font-display font-bold gradient-text">$29</span>
                <span class="text-xs text-muted-foreground mb-1">/month</span>
              </div>
              <button
                onclick="subscribeMonthlyPlan()"
                class="w-full gradient-btn py-3 rounded-xl font-display font-semibold text-sm active:scale-[0.97] transition-transform shadow-md shadow-primary/20"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Book Button (Mobile only; replaced by sidebar button on desktop) -->
      <button
        onclick="navigate('/booking')"
        class="fixed bottom-24 right-6 max-w-md gradient-btn w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow z-40 active:scale-90 transition-transform md:hidden"
      >
        ${renderIcon("sparkles", "text-primary-foreground", 22)}
      </button>

      ${renderBottomNav()}
    </div>
  `;
}

function setTransformation(index) {
  state.home.activeTransformationIndex = index;
  render();
}

function cycleTransformation() {
  state.home.activeTransformationIndex = (state.home.activeTransformationIndex + 1) % 2;
  render();
}

function toggleReviewLike(id) {
  state.home.likedReviews[id] = !state.home.likedReviews[id];
  if (state.home.likedReviews[id]) {
    API.toggleHelpful(id).catch(() => {});
    showToast("Marked review as helpful!");
  }
  render();
}

async function subscribeMonthlyPlan() {
  if (!API.isAuthenticated()) {
    openAuthModal("login");
    return;
  }
  try {
    await API.toggleSubscription();
    showToast("Subscribed to Monthly Cleaning Plan! 🎉");
    await fetchUserData();
    render();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ============================================================================
// SCREEN 3: SERVICES (#/services)
// ============================================================================

function renderServices() {
  const filterChips = ["All", "Popular", "Budget", "Premium"];

  // Filter logic
  let filteredServices = state.services;
  if (state.activeFilter === "Popular") {
    filteredServices = state.services.filter((s) => s.popular);
  } else if (state.activeFilter === "Budget") {
    filteredServices = state.services.filter((s) => s.rawPrice <= 30);
  } else if (state.activeFilter === "Premium") {
    filteredServices = state.services.filter((s) => s.rawPrice >= 55);
  }

  const selectedCompare = state.selectedCompareServices;

  return `
    <div class="w-full min-h-screen md:pl-[260px] pb-28 md:pb-12">
      <div class="max-w-md md:max-w-[1100px] mx-auto px-5 md:px-8 pt-8 md:pt-10 space-y-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-display font-bold">Our Services</h1>
          <p class="text-sm text-muted-foreground mt-1">Professional care for every sneaker</p>
        </div>

        <!-- Filter Chips -->
        <div class="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          ${filterChips
            .map(
              (filter) => `
            <button
              onclick="setServiceFilter('${filter}')"
              class="shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                state.activeFilter === filter
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "glass-card text-muted-foreground hover:text-foreground"
              }"
            >
              ${filter}
            </button>
          `
            )
            .join("")}
        </div>

        <!-- Services Grid & Comparison Side Panel Container -->
        <div class="grid grid-cols-1 ${selectedCompare.length === 2 ? "lg:grid-cols-3" : "lg:grid-cols-1"} gap-6 items-start">
          <!-- 2-Column Grid of Service Cards on Desktop -->
          <div class="${selectedCompare.length === 2 ? "lg:col-span-2" : ""} grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            ${filteredServices
              .map((service) => {
                const isExpanded = !!state.expandedServiceCards[service.id];
                const isComparing = selectedCompare.includes(service.id);
                const iconName = service.icon ? service.icon.toLowerCase() : "sparkles";

                return `
                <div class="glass-card rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${isExpanded ? "border-primary/30" : ""}">
                  <div>
                    ${
                      service.popular
                        ? `
                      <div class="w-full py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-primary-foreground" style="background: var(--gradient-primary)">
                        ⭐ Most Popular
                      </div>
                    `
                        : ""
                    }
                    <div class="p-5 space-y-4">
                      <div class="w-full h-2 rounded-full bg-gradient-to-r ${service.color}"></div>
                      <div class="flex justify-between items-start">
                        <div class="space-y-1.5 flex-1 pr-3">
                          <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                              ${renderIcon(iconName, "text-primary", 16)}
                            </div>
                            <h3 class="font-display font-semibold text-base">${service.name}</h3>
                          </div>
                          <p class="text-xs text-muted-foreground leading-relaxed">${service.description}</p>
                          <div class="flex items-center gap-3 pt-1">
                            <div class="flex items-center gap-1">
                              ${renderIcon("star", "text-primary fill-primary", 12)}
                              <span class="text-xs font-medium">${service.rating}</span>
                            </div>
                            <span class="text-[10px] text-muted-foreground">(${service.reviews} reviews)</span>
                          </div>
                        </div>
                        <div class="text-right shrink-0">
                          <p class="text-xl font-display font-bold gradient-text">${service.price}</p>
                          <div class="flex items-center gap-1 mt-1 justify-end">
                            ${renderIcon("clock", "text-muted-foreground", 12)}
                            <span class="text-xs text-muted-foreground">${service.time}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Expand/Collapse Details -->
                      <button
                        onclick="toggleServiceExpand('${service.id}')"
                        class="w-full flex items-center justify-center gap-1 text-xs text-primary font-medium py-1 hover:underline"
                      >
                        ${isExpanded ? "Hide details" : "What's included"}
                        ${renderIcon(isExpanded ? "chevron-up" : "chevron-down", "text-primary", 14)}
                      </button>

                      ${
                        isExpanded
                          ? `
                        <div class="space-y-2 animate-fade-in pt-1 border-t border-border">
                          <p class="text-xs font-medium text-muted-foreground pt-2">Includes:</p>
                          ${service.includes
                            .map(
                              (item) => `
                            <div class="flex items-center gap-2">
                              ${renderIcon("check", "text-primary shrink-0", 14)}
                              <span class="text-xs">${item}</span>
                            </div>
                          `
                            )
                            .join("")}
                        </div>
                      `
                          : ""
                      }
                    </div>
                  </div>

                  <div class="p-5 pt-0 flex gap-2">
                    <button
                      onclick="bookServiceNow('${service.id}')"
                      class="flex-1 gradient-btn py-3 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform shadow-sm shadow-primary/20"
                    >
                      Book Now
                      ${renderIcon("arrow-right", "text-primary-foreground", 16)}
                    </button>
                    <button
                      onclick="toggleCompareService('${service.id}')"
                      class="px-4 py-3 rounded-xl text-xs font-medium transition-all ${
                        isComparing ? "bg-primary/20 text-primary border border-primary/30 font-semibold" : "glass-card text-muted-foreground hover:text-foreground"
                      }"
                    >
                      Compare
                    </button>
                  </div>
                </div>
              `;
              })
              .join("")}
          </div>

          <!-- Comparison Side Panel (Appears as a side panel on desktop) -->
          ${
            selectedCompare.length === 2
              ? `
            <div class="lg:col-span-1 lg:sticky lg:top-8 glass-card rounded-2xl p-5 space-y-4 animate-fade-in border-primary/20 shadow-xl">
              <div class="flex items-center justify-between pb-2 border-b border-border/60">
                <div class="flex items-center gap-2">
                  ${renderIcon("columns", "text-primary", 16)}
                  <h3 class="font-display font-semibold text-sm">Service Comparison</h3>
                </div>
                <button onclick="clearCompare()" class="text-xs text-primary font-medium hover:underline">Clear</button>
              </div>
              <div class="grid grid-cols-2 gap-4">
                ${selectedCompare
                  .map((serviceId) => {
                    const s = state.services.find((x) => x.id === serviceId);
                    if (!s) return "";
                    return `
                    <div class="space-y-2 text-center">
                      <p class="font-display font-semibold text-sm">${s.name}</p>
                      <p class="text-xl font-display font-bold gradient-text">${s.price}</p>
                      <p class="text-[10px] text-muted-foreground">${s.time}</p>
                      <div class="text-left space-y-1.5 pt-2 border-t border-border/60">
                        ${s.includes
                          .map(
                            (item) => `
                          <div class="flex items-start gap-1">
                            ${renderIcon("check", "text-primary mt-0.5 shrink-0", 10)}
                            <span class="text-[10px] leading-tight">${item}</span>
                          </div>
                        `
                          )
                          .join("")}
                      </div>
                      <button
                        onclick="bookServiceNow('${s.id}')"
                        class="w-full mt-3 gradient-btn py-2 rounded-lg text-xs font-semibold"
                      >
                        Book
                      </button>
                    </div>
                  `;
                  })
                  .join("")}
              </div>
            </div>
          `
              : ""
          }
        </div>
      </div>
      ${renderBottomNav()}
    </div>
  `;
}

function setServiceFilter(filter) {
  state.activeFilter = filter;
  render();
}

function toggleServiceExpand(serviceId) {
  state.expandedServiceCards[serviceId] = !state.expandedServiceCards[serviceId];
  render();
}

function toggleCompareService(serviceId) {
  const current = state.selectedCompareServices;
  if (current.includes(serviceId)) {
    state.selectedCompareServices = current.filter((x) => x !== serviceId);
  } else if (current.length < 2) {
    state.selectedCompareServices = [...current, serviceId];
  } else {
    showToast("You can compare up to 2 services at a time");
  }
  render();
}

function clearCompare() {
  state.selectedCompareServices = [];
  render();
}

function bookServiceNow(serviceId) {
  state.booking.selectedServiceIds = [serviceId];
  state.booking.currentStep = 0;
  navigate("/booking");
}

// ============================================================================
// SCREEN 4: BOOKING (#/booking)
// 5-Step Flow: Service -> Schedule -> Address -> Photos -> Payment
// MULTI-SERVICE SELECTION DELIBERATE REQUIREMENT SUPPORTED!
// ============================================================================

const bookingSteps = ["Service", "Schedule", "Address", "Photos", "Payment"];
const bookingTimeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

function renderBooking() {
  const b = state.booking;
  const currentStep = b.currentStep;

  // 7 days date generator
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      date: d,
      weekday: d.toLocaleDateString("en", { weekday: "short" }),
      day: d.getDate(),
      month: d.toLocaleDateString("en", { month: "short" }),
      isToday: i === 0,
    };
  });

  return `
    <div class="w-full min-h-screen md:pl-[260px] pb-28 lg:pb-12 flex flex-col">
      <div class="max-w-md md:max-w-[1100px] mx-auto px-5 md:px-8 pt-8 md:pt-10 w-full flex-1">
        <!-- Header -->
        <div class="flex items-center gap-4 mb-6">
          <button
            onclick="handleBookingBack()"
            class="w-10 h-10 rounded-xl glass-card flex items-center justify-center active:scale-90 transition-transform"
          >
            ${renderIcon("arrow-left", "text-foreground", 18)}
          </button>
          <div>
            <h1 class="font-display font-semibold text-lg md:text-2xl">Book Cleaning</h1>
            <p class="text-xs text-muted-foreground">Step ${currentStep + 1} of ${bookingSteps.length} — ${bookingSteps[currentStep]}</p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="flex gap-2 mb-6">
          ${bookingSteps
            .map(
              (_, i) => `
            <div class="flex-1 h-1.5 rounded-full overflow-hidden bg-secondary">
              <div
                class="h-full rounded-full transition-all duration-500 ${i <= currentStep ? "w-full" : "w-0"}"
                style="${i <= currentStep ? "background: var(--gradient-primary)" : ""}"
              ></div>
            </div>
          `
            )
            .join("")}
        </div>

        <!-- 2-Column Grid on Desktop (Main Step Content on Left, Sticky Summary on Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <!-- Main Step Column -->
          <div class="lg:col-span-7 xl:col-span-8 space-y-6">
            ${currentStep === 0 ? renderBookingStep0() : ""}
            ${currentStep === 1 ? renderBookingStep1(dates) : ""}
            ${currentStep === 2 ? renderBookingStep2() : ""}
            ${currentStep === 3 ? renderBookingStep3() : ""}
            ${currentStep === 4 ? renderBookingStep4() : ""}

            <!-- Desktop In-Column Continue / Back Button (Visible on lg+) -->
            <div class="hidden lg:flex items-center gap-4 pt-6 border-t border-border/60">
              ${
                currentStep > 0
                  ? `
                <button
                  onclick="handleBookingBack()"
                  class="px-6 py-3.5 rounded-xl glass-card text-sm font-semibold hover:bg-secondary/60 active:scale-[0.98] transition-all"
                >
                  Back
                </button>
              `
                  : ""
              }
              <button
                onclick="handleBookingNext()"
                ${!canProceedBooking() ? "disabled" : ""}
                class="flex-1 gradient-btn py-3.5 rounded-xl font-display font-semibold text-sm disabled:opacity-40 disabled:hover:transform-none disabled:hover:shadow-none active:scale-[0.98] transition-all shadow-md shadow-primary/20"
              >
                ${currentStep === bookingSteps.length - 1 ? `Confirm & Pay $${getBookingTotal()}` : "Continue"}
              </button>
            </div>
          </div>

          <!-- Sticky Order Summary Card on Desktop (Right Column) -->
          <div class="hidden lg:block lg:col-span-5 xl:col-span-4">
            ${renderBookingOrderSummaryCard()}
          </div>
        </div>
      </div>

      <!-- Mobile Bottom CTA Bar (Hidden on desktop lg+) -->
      <div class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 pb-6 pt-4 bg-gradient-to-t from-background via-background to-background/0 z-40 lg:hidden">
        <button
          onclick="handleBookingNext()"
          ${!canProceedBooking() ? "disabled" : ""}
          class="w-full gradient-btn py-4 rounded-2xl font-display font-semibold text-base disabled:opacity-40 disabled:hover:transform-none disabled:hover:shadow-none active:scale-[0.97] transition-transform shadow-lg shadow-primary/20"
        >
          ${currentStep === bookingSteps.length - 1 ? `Confirm & Pay $${getBookingTotal()}` : "Continue"}
        </button>
      </div>

      ${renderBottomNav()}
    </div>
  `;
}

function renderBookingOrderSummaryCard() {
  const b = state.booking;
  const selectedServices = state.services.filter((s) => b.selectedServiceIds.includes(s.id));
  const selectedAddons = state.addOns.filter((a) => b.selectedAddonIds.includes(a.id));
  const total = getBookingTotal();
  const subtotal = getBookingSubtotal();
  const discount = b.promoApplied ? Math.round(subtotal * 0.2) : 0;

  return `
    <div class="sticky top-8 glass-card rounded-2xl p-6 space-y-5 border-primary/20 shadow-xl">
      <div class="flex items-center justify-between pb-3 border-b border-border/60">
        <h3 class="font-display font-bold text-base">Order Summary</h3>
        <span class="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full font-semibold">
          ${selectedServices.length} ${selectedServices.length === 1 ? "Pair" : "Pairs"}
        </span>
      </div>

      <!-- Services List -->
      <div class="space-y-2">
        <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Services</p>
        ${
          selectedServices.length === 0
            ? `<p class="text-xs text-muted-foreground italic">No service selected yet.</p>`
            : selectedServices
                .map(
                  (s) => `
          <div class="flex justify-between items-center text-xs">
            <span class="font-medium">${s.name}</span>
            <span class="font-bold font-display gradient-text">${s.price}</span>
          </div>
        `
                )
                .join("")
        }
      </div>

      <!-- Add-ons List -->
      ${
        selectedAddons.length > 0
          ? `
        <div class="space-y-2 pt-2 border-t border-border/40">
          <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add-Ons</p>
          ${selectedAddons
            .map(
              (a) => `
            <div class="flex justify-between items-center text-xs text-muted-foreground">
              <span>${a.name}</span>
              <span class="text-foreground">${a.price}</span>
            </div>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }

      <!-- Promo Section -->
      <div class="space-y-2 pt-2 border-t border-border/40">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Pickup & Delivery</span>
          <span class="text-primary font-semibold">FREE</span>
        </div>
        ${
          b.promoApplied
            ? `
          <div class="flex items-center justify-between text-xs text-primary font-medium">
            <span>Promo (CLEAN20)</span>
            <span>-$${discount}</span>
          </div>
        `
            : ""
        }
      </div>

      <!-- Total Breakdown -->
      <div class="pt-3 border-t border-border/60 flex justify-between items-baseline">
        <div>
          <p class="text-xs text-muted-foreground">Estimated Total</p>
          <p class="text-[10px] text-muted-foreground/80">Taxes & pickup included</p>
        </div>
        <div class="text-right">
          <span class="text-2xl font-display font-bold gradient-text">$${total}</span>
        </div>
      </div>

      <!-- Action Button inside summary card -->
      <button
        onclick="handleBookingNext()"
        ${!canProceedBooking() ? "disabled" : ""}
        class="w-full gradient-btn py-3.5 rounded-xl font-display font-semibold text-sm disabled:opacity-40 disabled:hover:transform-none disabled:hover:shadow-none active:scale-[0.98] transition-all shadow-md shadow-primary/20"
      >
        ${b.currentStep === bookingSteps.length - 1 ? `Confirm & Pay $${total}` : "Continue"}
      </button>
    </div>
  `;
}

// Step 0: Service & Add-ons (Multi-service checkmarks)
function renderBookingStep0() {
  const selectedIds = state.booking.selectedServiceIds;
  const selectedAddons = state.booking.selectedAddonIds;

  return `
    <div class="space-y-3 animate-fade-in">
      <div class="flex items-center justify-between mb-2">
        <h2 class="font-display font-semibold text-base">Select Services</h2>
        <span class="text-xs text-primary font-medium">${selectedIds.length} selected</span>
      </div>
      <p class="text-xs text-muted-foreground -mt-2 mb-3">You can select multiple pairs or treatments in one pickup.</p>

      ${state.services
        .map((s) => {
          const isSelected = selectedIds.includes(s.id);
          return `
          <button
            onclick="toggleBookingService('${s.id}')"
            class="w-full glass-card rounded-2xl p-4 flex items-center gap-4 transition-all text-left active:scale-[0.98] ${
              isSelected ? "border-primary/50 bg-primary/5" : ""
            }"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? "bg-primary/20" : "bg-secondary"}">
              ${renderIcon("sparkles", isSelected ? "text-primary" : "text-muted-foreground", 18)}
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <p class="font-display font-semibold text-sm">${s.name}</p>
                ${s.popular ? `<span class="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">Popular</span>` : ""}
              </div>
              <p class="text-[11px] text-muted-foreground mt-0.5">${s.description}</p>
              <div class="flex items-center gap-3 mt-1">
                <div class="flex items-center gap-1">
                  ${renderIcon("clock", "text-muted-foreground", 12)}
                  <span class="text-xs text-muted-foreground">${s.time}</span>
                </div>
                <div class="flex items-center gap-0.5">
                  ${renderIcon("star", "text-primary fill-primary", 10)}
                  <span class="text-[10px] text-muted-foreground">${s.rating}</span>
                </div>
              </div>
            </div>
            <span class="font-display font-bold text-base gradient-text">${s.price}</span>
            <div class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
              isSelected ? "border-primary bg-primary" : "border-muted-foreground/50"
            }">
              ${isSelected ? renderIcon("check", "text-primary-foreground", 12) : ""}
            </div>
          </button>
        `;
        })
        .join("")}

      <!-- Add-ons -->
      ${
        selectedIds.length > 0
          ? `
        <div class="space-y-2 pt-4 animate-fade-in">
          <h3 class="font-display font-semibold text-sm">Add-ons</h3>
          ${state.addOns
            .map((addon) => {
              const isSelected = selectedAddons.includes(addon.id);
              return `
              <button
                onclick="toggleBookingAddon('${addon.id}')"
                class="w-full glass-card rounded-xl p-3 flex items-center gap-3 text-left transition-all active:scale-[0.98] ${
                  isSelected ? "border-primary/50 bg-primary/5" : ""
                }"
              >
                <div class="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                }">
                  ${isSelected ? renderIcon("check", "text-primary-foreground", 10) : ""}
                </div>
                <span class="text-sm flex-1">${addon.name}</span>
                <span class="text-xs text-primary font-medium">${addon.price}</span>
              </button>
            `;
            })
            .join("")}
        </div>
      `
          : ""
      }
    </div>
  `;
}

// Step 1: Schedule (Date scroller, time slots, instructions)
function renderBookingStep1(dates) {
  const b = state.booking;

  return `
    <div class="space-y-6 animate-fade-in">
      <div>
        <h2 class="font-display font-semibold text-base mb-4">Pick a Date</h2>
        <div class="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          ${dates
            .map(
              (d, i) => `
            <button
              onclick="setBookingDate(${i})"
              class="shrink-0 w-16 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all snap-start active:scale-95 ${
                b.selectedDateIndex === i ? "bg-primary/20 border border-primary/50" : "glass-card"
              }"
            >
              <span class="text-[10px] text-muted-foreground uppercase">${d.weekday}</span>
              <span class="text-lg font-display font-bold">${d.day}</span>
              <span class="text-[10px] text-muted-foreground">${d.month}</span>
              ${d.isToday ? `<span class="text-[8px] text-primary font-medium">Today</span>` : ""}
            </button>
          `
            )
            .join("")}
        </div>
      </div>

      <div>
        <h2 class="font-display font-semibold text-base mb-4">Pick a Time</h2>
        <div class="grid grid-cols-3 gap-2">
          ${bookingTimeSlots
            .map(
              (t) => `
            <button
              onclick="setBookingTime('${t}')"
              class="py-3 rounded-xl text-sm font-medium transition-all active:scale-95 ${
                b.selectedTimeSlot === t ? "bg-primary/20 border border-primary/50 text-primary" : "glass-card text-muted-foreground"
              }"
            >
              ${t}
            </button>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- Notes -->
      <div>
        <h2 class="font-display font-semibold text-base mb-3">Special Instructions</h2>
        <textarea
          oninput="state.booking.instructions = this.value"
          placeholder="E.g., ring doorbell, leave at door..."
          class="w-full bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none h-20"
        >${b.instructions || ""}</textarea>
      </div>
    </div>
  `;
}

// Step 2: Address (Street, City, Zip, Use Current Location, Saved Addresses)
function renderBookingStep2() {
  const b = state.booking;
  const savedAddrs = state.profile.addresses || [];

  return `
    <div class="space-y-4 animate-fade-in">
      <h2 class="font-display font-semibold text-base mb-4">Pickup Address</h2>
      <div class="glass-card rounded-2xl p-4 space-y-4">
        <div class="w-full h-40 rounded-xl bg-secondary flex items-center justify-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
          ${renderIcon("map-pin", "text-muted-foreground", 32)}
        </div>
        <input
          type="text"
          placeholder="Street address"
          value="${b.address.street || ""}"
          oninput="state.booking.address.street = this.value"
          class="w-full bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <div class="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="City"
            value="${b.address.city || "New York"}"
            oninput="state.booking.address.city = this.value"
            class="bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value="${b.address.zip || "10001"}"
            oninput="state.booking.address.zip = this.value"
            class="bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <button
        onclick="useCurrentLocation()"
        class="w-full glass-card rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 text-primary hover:bg-primary/10 active:scale-[0.97] transition-all"
      >
        ${renderIcon("map-pin", "text-primary", 16)} Use Current Location
      </button>

      <!-- Saved Addresses -->
      <div class="space-y-2">
        <p class="text-xs text-muted-foreground">Saved Addresses</p>
        ${
          savedAddrs.length > 0
            ? savedAddrs
                .map(
                  (a) => `
              <button
                onclick="selectSavedAddress('${a.street.replace(/'/g, "\\'")}', '${a.city.replace(/'/g, "\\'")}', '${a.zip}')"
                class="w-full glass-card rounded-xl p-3 flex items-center gap-3 text-left hover:border-primary/30 active:scale-[0.98] transition-all"
              >
                ${renderIcon("map-pin", "text-primary shrink-0", 14)}
                <div>
                  <p class="text-sm font-medium">${a.label}</p>
                  <p class="text-xs text-muted-foreground">${a.street}, ${a.city}</p>
                </div>
              </button>
            `
                )
                .join("")
            : `
            <div class="glass-card rounded-xl p-3 text-xs text-muted-foreground">
              No saved addresses found. Enter address above or save one in your Profile.
            </div>
          `
        }
      </div>
    </div>
  `;
}

// Step 3: Photos (4 slots with real file upload support)
function renderBookingStep3() {
  const b = state.booking;
  const slots = [
    { n: 1, label: "Front" },
    { n: 2, label: "Back" },
    { n: 3, label: "Sole" },
    { n: 4, label: "Side" },
  ];

  return `
    <div class="space-y-4 animate-fade-in">
      <h2 class="font-display font-semibold text-base mb-2">Upload Sneaker Photos</h2>
      <div class="flex items-start gap-2 glass-card rounded-xl p-3">
        ${renderIcon("info", "text-primary shrink-0 mt-0.5", 14)}
        <p class="text-xs text-muted-foreground">Photos help us assess condition and provide accurate pricing. At least 2 photos recommended.</p>
      </div>

      <div class="grid grid-cols-2 gap-3 mt-2">
        ${slots
          .map(({ n, label }) => {
            const uploaded = b.uploadedPhotos.find((p) => p.slotNumber === n);
            return `
            <div
              onclick="triggerPhotoUpload(${n}, '${label}')"
              class="aspect-square glass-card rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 relative overflow-hidden ${
                uploaded ? "border-primary/50 bg-primary/5" : "hover:border-primary/30"
              }"
            >
              ${
                uploaded
                  ? `
                <img src="${uploaded.photoUrl}" alt="${label}" class="absolute inset-0 w-full h-full object-cover opacity-60" />
                <div class="relative z-10 w-10 h-10 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                  ${renderIcon("check", "text-primary", 20)}
                </div>
                <span class="relative z-10 text-[10px] text-primary font-medium">${label} ✓</span>
              `
                  : `
                ${renderIcon("camera", "text-muted-foreground", 24)}
                <span class="text-[10px] text-muted-foreground">${label}</span>
              `
              }
            </div>
          `;
          })
          .join("")}
      </div>

      <input type="file" id="booking-photo-input" accept="image/*" class="hidden" onchange="handlePhotoFileSelected(event)" />

      <p class="text-[10px] text-muted-foreground text-center">${b.uploadedPhotos.length}/4 photos uploaded</p>
      <button
        onclick="document.getElementById('booking-photo-input').click()"
        class="w-full glass-card rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 text-primary mt-2 hover:bg-primary/10 active:scale-[0.97] transition-all"
      >
        ${renderIcon("upload", "text-primary", 16)} Upload from Gallery
      </button>
    </div>
  `;
}

// Step 4: Payment Summary (CLEAN20 promo, calculation breakdown)
function renderBookingStep4() {
  const b = state.booking;
  const selectedServices = state.services.filter((s) => b.selectedServiceIds.includes(s.id));
  const selectedAddons = state.addOns.filter((a) => b.selectedAddonIds.includes(a.id));

  const subtotal = getBookingSubtotal();
  const total = getBookingTotal();

  return `
    <div class="space-y-4 animate-fade-in">
      <h2 class="font-display font-semibold text-base mb-4">Payment Summary</h2>
      <div class="glass-card rounded-2xl p-5 space-y-3">
        ${selectedServices
          .map(
            (s) => `
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">${s.name}</span>
            <span class="font-medium">${s.price}</span>
          </div>
        `
          )
          .join("")}

        ${selectedAddons
          .map(
            (a) => `
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">${a.name}</span>
            <span class="font-medium">${a.price}</span>
          </div>
        `
          )
          .join("")}

        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Pickup Fee</span>
          <span class="font-medium text-primary">Free</span>
        </div>

        ${
          b.promoApplied
            ? `
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Promo (${b.promoCode})</span>
            <span class="font-medium text-primary">-20% (-$${b.promoDiscount})</span>
          </div>
        `
            : ""
        }

        <div class="border-t border-border pt-3 flex justify-between">
          <span class="font-display font-semibold">Total</span>
          <span class="font-display font-bold text-lg gradient-text">$${total}</span>
        </div>
      </div>

      <!-- Promo Code Input -->
      ${
        !b.promoApplied
          ? `
        <div class="flex gap-2">
          <input
            type="text"
            id="promo-input"
            placeholder="Promo code (e.g. CLEAN20)"
            value="${b.promoCode || ""}"
            class="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary uppercase"
          />
          <button
            onclick="applyBookingPromo()"
            class="px-4 py-3 glass-card rounded-xl text-sm font-medium text-primary hover:bg-primary/10 active:scale-[0.97] transition-all"
          >
            Apply
          </button>
        </div>
      `
          : `
        <div class="glass-card rounded-xl p-3 flex items-center justify-between">
          <span class="text-xs text-primary font-medium">✓ Promo code CLEAN20 applied (20% off)</span>
          <button onclick="removeBookingPromo()" class="text-xs text-muted-foreground hover:text-destructive">Remove</button>
        </div>
      `
      }

      <!-- Payment Method -->
      <div class="glass-card rounded-2xl p-4 flex items-center gap-4">
        <div class="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          ${renderIcon("credit-card", "text-muted-foreground", 18)}
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium">•••• •••• •••• 4242</p>
          <p class="text-xs text-muted-foreground">Visa</p>
        </div>
        <button onclick="showToast('Payment card updated!')" class="text-xs text-primary font-medium hover:underline">Change</button>
      </div>

      <!-- Security Badge -->
      <div class="flex items-center justify-center gap-2 pt-2">
        ${renderIcon("shield", "text-muted-foreground", 14)}
        <span class="text-[10px] text-muted-foreground">Secured by 256-bit SSL encryption</span>
      </div>
    </div>
  `;
}

function toggleBookingService(serviceId) {
  const current = state.booking.selectedServiceIds;
  if (current.includes(serviceId)) {
    state.booking.selectedServiceIds = current.filter((id) => id !== serviceId);
  } else {
    state.booking.selectedServiceIds = [...current, serviceId];
  }
  recalculateBookingPricing();
  render();
}

function toggleBookingAddon(addonId) {
  const current = state.booking.selectedAddonIds;
  if (current.includes(addonId)) {
    state.booking.selectedAddonIds = current.filter((id) => id !== addonId);
  } else {
    state.booking.selectedAddonIds = [...current, addonId];
  }
  recalculateBookingPricing();
  render();
}

function setBookingDate(idx) {
  state.booking.selectedDateIndex = idx;
  render();
}

function setBookingTime(timeSlot) {
  state.booking.selectedTimeSlot = timeSlot;
  render();
}

function selectSavedAddress(street, city, zip) {
  state.booking.address = { street, city, zip };
  showToast("Address selected!");
  render();
}

function useCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.booking.address = {
          street: "742 Evergreen Terrace",
          city: "New York",
          zip: "10021",
        };
        showToast("Located via GPS: 742 Evergreen Terrace, NY");
        render();
      },
      () => {
        state.booking.address = {
          street: "350 5th Ave",
          city: "New York",
          zip: "10118",
        };
        showToast("Using default Manhattan location");
        render();
      }
    );
  } else {
    state.booking.address = {
      street: "350 5th Ave",
      city: "New York",
      zip: "10118",
    };
    render();
  }
}

let activeUploadSlot = 1;
let activeUploadLabel = "Front";

function triggerPhotoUpload(slotNumber, label) {
  activeUploadSlot = slotNumber;
  activeUploadLabel = label;
  const input = document.getElementById("booking-photo-input");
  if (input) input.click();
}

function handlePhotoFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Enforce 2 MB limit
  if (file.size > 2 * 1024 * 1024) {
    showToast("File size exceeds 2 MB limit! Please choose an image under 2MB.", "error");
    return;
  }

  // Enforce image types only
  if (!file.type || !file.type.startsWith("image/")) {
    showToast("Only image files (JPEG, PNG, WEBP) are allowed!", "error");
    return;
  }

  try {
    const previewUrl = URL.createObjectURL(file);
    // Remove if slot already occupied
    state.booking.uploadedPhotos = state.booking.uploadedPhotos.filter((p) => p.slotNumber !== activeUploadSlot);
    state.booking.uploadedPhotos.push({
      slotNumber: activeUploadSlot,
      slotLabel: activeUploadLabel,
      file: file,
      photoUrl: previewUrl,
      originalFilename: file.name,
      fileSize: file.size,
    });
    showToast(`Attached ${activeUploadLabel} photo!`);
    render();
  } catch (err) {
    showToast(`Attachment failed: ${err.message}`, "error");
  }
}

async function applyBookingPromo() {
  const code = (document.getElementById("promo-input")?.value || "").trim().toUpperCase();
  if (!code) {
    showToast("Please enter a promo code", "error");
    return;
  }

  try {
    const calculation = await API.calculatePrice({
      serviceIds: state.booking.selectedServiceIds,
      addOnIds: state.booking.selectedAddonIds,
      promoCode: code,
    });

    if (calculation.promoApplied) {
      state.booking.promoCode = code;
      state.booking.promoApplied = true;
      state.booking.promoDiscount = calculation.discount;
      state.booking.calculatedTotal = calculation.total;
      showToast("Promo code applied! 20% off");
    } else {
      showToast("Invalid promo code", "error");
    }
    render();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function removeBookingPromo() {
  state.booking.promoApplied = false;
  state.booking.promoCode = "";
  state.booking.promoDiscount = 0;
  recalculateBookingPricing();
  render();
}

function getBookingSubtotal() {
  let subtotal = 0;
  for (const id of state.booking.selectedServiceIds) {
    const s = state.services.find((x) => x.id === id);
    if (s) subtotal += s.rawPrice || 0;
  }
  for (const id of state.booking.selectedAddonIds) {
    const a = state.addOns.find((x) => x.id === id);
    if (a) subtotal += a.rawPrice || 0;
  }
  return subtotal;
}

function getBookingTotal() {
  const subtotal = getBookingSubtotal();
  if (state.booking.promoApplied) {
    return Math.round(subtotal * 0.8);
  }
  return subtotal;
}

function recalculateBookingPricing() {
  // Local quick calculation
  const subtotal = getBookingSubtotal();
  state.booking.calculatedSubtotal = subtotal;
  state.booking.calculatedTotal = getBookingTotal();
}

function canProceedBooking() {
  const b = state.booking;
  if (b.currentStep === 0) return b.selectedServiceIds.length > 0;
  if (b.currentStep === 1) return b.selectedTimeSlot !== null;
  if (b.currentStep === 2) return b.address && b.address.street && b.address.street.trim().length > 0;
  return true;
}

function handleBookingBack() {
  if (state.booking.currentStep > 0) {
    state.booking.currentStep--;
    render();
  } else {
    navigate("/services");
  }
}

async function handleBookingNext() {
  if (state.booking.currentStep < bookingSteps.length - 1) {
    state.booking.currentStep++;
    render();
  } else {
    // Submit order to backend!
    if (!API.isAuthenticated()) {
      openAuthModal("login");
      return;
    }

    try {
      showToast("Placing order...");
      const orderData = {
        serviceIds: state.booking.selectedServiceIds,
        addOnIds: state.booking.selectedAddonIds,
        scheduledDate: state.booking.selectedDateIndex === 0 ? "Today" : `Day +${state.booking.selectedDateIndex}`,
        scheduledTimeSlot: state.booking.selectedTimeSlot,
        address: state.booking.address,
        specialInstructions: state.booking.instructions,
        promoCode: state.booking.promoApplied ? state.booking.promoCode : null,
        photos: state.booking.uploadedPhotos,
      };

      const placed = await API.createOrder(orderData);

      // Upload photos as BLOBs to database for this newly created order
      if (state.booking.uploadedPhotos && state.booking.uploadedPhotos.length > 0) {
        showToast("Saving sneaker photos to database...");
        for (const p of state.booking.uploadedPhotos) {
          if (p.file) {
            try {
              await API.uploadOrderPhoto(placed.id, p.slotLabel.toLowerCase(), p.file);
            } catch (photoErr) {
              console.error("Photo upload failed:", photoErr);
            }
          }
        }
      }

      showToast("Order placed successfully with photos! 🎉");

      // Reset booking state
      state.booking.selectedServiceIds = [];
      state.booking.selectedAddonIds = [];
      state.booking.uploadedPhotos = [];
      state.booking.promoApplied = false;
      state.booking.currentStep = 0;

      await fetchUserData();
      setTimeout(() => navigate("/orders"), 1000);
    } catch (err) {
      showToast(`Failed to place order: ${err.message}`, "error");
    }
  }
}

// ============================================================================
// SCREEN 5: ORDERS (#/orders)
// ============================================================================

function renderOrders() {
  const activeTab = state.orders.activeTab;
  const activeOrders = state.orders.activeOrders;
  const pastOrders = state.orders.pastOrders;

  // Use primary active order for tracking timeline
  const activeOrder = activeOrders.length > 0 ? activeOrders[0] : null;

  return `
    <div class="w-full min-h-screen md:pl-[260px] pb-28 md:pb-12">
      <div class="max-w-md md:max-w-[1100px] mx-auto px-5 md:px-8 pt-8 md:pt-10 space-y-6">
        <div>
          <h1 class="text-2xl md:text-3xl font-display font-bold">My Orders</h1>
          <p class="text-sm text-muted-foreground mt-1">Track your sneaker's journey</p>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 p-1 glass-card rounded-xl max-w-xs">
          <button
            onclick="setOrdersTab('active')"
            class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === "active" ? "bg-primary/20 text-primary" : "text-muted-foreground"
            }"
          >
            Active (${activeOrders.length})
          </button>
          <button
            onclick="setOrdersTab('past')"
            class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === "past" ? "bg-primary/20 text-primary" : "text-muted-foreground"
            }"
          >
            Past (${pastOrders.length})
          </button>
        </div>

        ${activeTab === "active" ? renderActiveOrdersTab(activeOrder) : renderPastOrdersTab(pastOrders)}
      </div>
      ${renderBottomNav()}
    </div>
  `;
}

function renderActiveOrdersTab(order) {
  if (!order) {
    return `
      <div class="glass-card rounded-2xl p-8 text-center space-y-3">
        <div class="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto">
          ${renderIcon("package", "text-primary", 24)}
        </div>
        <h3 class="font-display font-semibold text-base">No Active Orders</h3>
        <p class="text-xs text-muted-foreground">Book a sneaker cleaning today and track your progress in real-time.</p>
        <button onclick="navigate('/booking')" class="gradient-btn px-6 py-2.5 rounded-xl text-xs font-semibold">
          Book Cleaning
        </button>
      </div>
    `;
  }

  const showDetail = state.orders.showActiveDetail;
  const trackingSteps = order.trackingSteps && order.trackingSteps.length > 0 ? order.trackingSteps : [
    { label: "Pickup Scheduled", time: "Today, 2:00 PM", done: true, detail: "Driver assigned: Mike R." },
    { label: "Picked Up", time: "Today, 2:15 PM", done: true, detail: "Shoes collected from your address" },
    { label: "Cleaning in Progress", time: "In progress", done: false, active: true, detail: "Currently being deep cleaned by our experts" },
    { label: "Quality Check", time: "Estimated: Tomorrow", done: false, detail: "Final inspection before delivery" },
    { label: "Out for Delivery", time: "Estimated: Tomorrow 4PM", done: false, detail: "Will be delivered to your address" },
  ];

  return `
    <div class="glass-card rounded-2xl overflow-hidden">
      <button
        onclick="toggleActiveOrderDetail()"
        class="w-full p-5 flex items-center gap-3 text-left"
      >
        <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
          ${renderIcon("package", "text-primary", 18)}
        </div>
        <div class="text-left flex-1">
          <p class="font-display font-semibold text-sm">${order.service}</p>
          <p class="text-xs text-muted-foreground">Order #${order.id}</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">${order.status}</span>
          ${renderIcon(showDetail ? "chevron-up" : "chevron-down", "text-muted-foreground", 16)}
        </div>
      </button>

      ${
        showDetail
          ? `
        <div class="px-5 pb-5 pt-2 animate-fade-in">
          <!-- 2 Columns on Desktop: Timeline on one side, Order Info on the other -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <!-- Left Column on Desktop: Timeline & Progress Bar -->
            <div class="space-y-5 order-2 md:order-1">
              <!-- Progress Bar -->
              <div>
                <div class="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                  <span>Progress</span>
                  <span>${order.progressPercentage || 45}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-1000"
                    style="width: ${order.progressPercentage || 45}%; background: var(--gradient-primary)"
                  ></div>
                </div>
              </div>

              <!-- Timeline -->
              <div class="space-y-0">
                ${trackingSteps
                  .map((step, i) => {
                    const isExpanded = state.orders.expandedStepIndex === i;
                    return `
                    <button
                      onclick="setExpandedTimelineStep(${i})"
                      class="flex gap-4 w-full text-left cursor-pointer"
                    >
                      <div class="flex flex-col items-center">
                        <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          step.done ? "bg-primary" : step.active ? "bg-primary/30 border-2 border-primary" : "bg-secondary"
                        }">
                          ${step.done ? renderIcon("check", "text-primary-foreground", 12) : ""}
                          ${step.active ? `<div class="w-2 h-2 rounded-full bg-primary animate-pulse"></div>` : ""}
                        </div>
                        ${
                          i < trackingSteps.length - 1
                            ? `
                          <div class="w-0.5 ${isExpanded ? "h-16" : "h-10"} transition-all ${step.done ? "bg-primary/50" : "bg-secondary"}"></div>
                        `
                            : ""
                        }
                      </div>
                      <div class="${i < trackingSteps.length - 1 ? "pb-4" : ""}">
                        <p class="text-sm font-medium ${step.done || step.active ? "text-foreground" : "text-muted-foreground"}">${step.label}</p>
                        <p class="text-xs mt-0.5 ${step.active ? "text-primary" : "text-muted-foreground"}">${step.time}</p>
                        ${
                          isExpanded
                            ? `
                          <p class="text-[11px] text-muted-foreground mt-1.5 leading-relaxed animate-fade-in">${step.detail}</p>
                        `
                            : ""
                        }
                      </div>
                    </button>
                  `;
                  })
                  .join("")}
              </div>
            </div>

            <!-- Right Column on Desktop: Info Cards, Condition Photos & Contact Driver -->
            <div class="space-y-5 order-1 md:order-2">
              <!-- Order Info Cards -->
              <div class="grid grid-cols-3 gap-2">
                <div class="bg-secondary rounded-xl p-3 text-center">
                  ${renderIcon("clock", "text-muted-foreground mx-auto mb-1", 14)}
                  <p class="text-[10px] text-muted-foreground">ETA</p>
                  <p class="text-xs font-bold">${order.eta || "Tomorrow"}</p>
                </div>
                <div class="bg-secondary rounded-xl p-3 text-center">
                  ${renderIcon("map-pin", "text-muted-foreground mx-auto mb-1", 14)}
                  <p class="text-[10px] text-muted-foreground">Pickup</p>
                  <p class="text-xs font-bold truncate">${order.pickupAddress || "123 Main"}</p>
                </div>
                <div class="bg-secondary rounded-xl p-3 text-center">
                  ${renderIcon("image", "text-muted-foreground mx-auto mb-1", 14)}
                  <p class="text-[10px] text-muted-foreground">Photos</p>
                  <p class="text-xs font-bold">${order.photosCount || 3} uploaded</p>
                </div>
              </div>

              ${
                order.photoUrls && order.photoUrls.length > 0
                  ? `
              <!-- Uploaded Condition Photos (Served from Database BLOB) -->
              <div class="space-y-1.5">
                <p class="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  ${renderIcon("camera", "text-primary", 12)} Condition Photos (${order.photoUrls.length})
                </p>
                <div class="flex gap-2 overflow-x-auto pb-1">
                  ${order.photoUrls
                    .map(
                      (url) => `
                    <a href="${url}" target="_blank" class="shrink-0 w-16 h-16 rounded-xl overflow-hidden glass-card border border-primary/20 hover:border-primary transition-all">
                      <img src="${url}" alt="Condition Photo" class="w-full h-full object-cover" />
                    </a>
                  `
                    )
                    .join("")}
                </div>
              </div>
              `
                  : ""
              }

              <!-- Contact Driver -->
              <div class="flex gap-2">
                <button
                  onclick="showToast('Calling driver Mike R. (+1-555-0192)...')"
                  class="flex-1 glass-card rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium hover:border-primary/30 active:scale-[0.97] transition-all"
                >
                  ${renderIcon("phone", "text-primary", 16)}
                  Call Driver
                </button>
                <button
                  onclick="showToast('Chat session opened with driver Mike R.')"
                  class="flex-1 glass-card rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-medium hover:border-primary/30 active:scale-[0.97] transition-all"
                >
                  ${renderIcon("message-circle", "text-primary", 16)}
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>
      `
          : ""
      }
    </div>
  `;
}

function renderPastOrdersTab(orders) {
  if (!orders || orders.length === 0) {
    return `
      <div class="glass-card rounded-2xl p-8 text-center space-y-3">
        <p class="text-xs text-muted-foreground">No past orders yet.</p>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      ${orders
        .map((order) => {
          const isRating = state.orders.ratingOrderId === order.id;
          const currentRating = order.rating || 0;

          return `
          <div class="glass-card rounded-2xl p-4 space-y-3 flex flex-col justify-between">
            <div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  ${renderIcon("check", "text-primary", 18)}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium">${order.service}</p>
                  <p class="text-xs text-muted-foreground">${order.id} • ${order.date}</p>
                </div>
                <div class="text-right">
                  <span class="text-sm font-display font-bold gradient-text">${order.price}</span>
                  <p class="text-[10px] text-primary font-medium">${order.status}</p>
                </div>
              </div>
            </div>

            <!-- Rating Area -->
            ${
              isRating
                ? `
              <div class="flex items-center gap-3 animate-fade-in pt-1 border-t border-border/40">
                <div class="flex gap-1">
                  ${[1, 2, 3, 4, 5]
                    .map(
                      (star) => `
                    <button
                      onmouseenter="setHoverRating(${star})"
                      onmouseleave="setHoverRating(0)"
                      onclick="submitOrderRating('${order.id}', ${star})"
                      class="p-0.5"
                    >
                      ${renderIcon(
                        "star",
                        `transition-colors ${star <= state.orders.hoverRating ? "text-primary fill-primary" : "text-muted-foreground"}`,
                        20
                      )}
                    </button>
                  `
                    )
                    .join("")}
                </div>
                <button onclick="setRatingOrder(null)" class="text-xs text-muted-foreground">Cancel</button>
              </div>
            `
                : `
              <div class="flex items-center gap-2 pt-1 border-t border-border/40">
                ${
                  order.rated
                    ? `
                  <div class="flex gap-0.5">
                    ${[1, 2, 3, 4, 5]
                      .map((star) =>
                        renderIcon("star", star <= currentRating ? "text-primary fill-primary" : "text-muted-foreground", 12)
                      )
                      .join("")}
                  </div>
                `
                    : `
                  <button
                    onclick="setRatingOrder('${order.id}')"
                    class="text-xs text-primary font-medium hover:underline"
                  >
                    Rate this order
                  </button>
                `
                }
                <div class="flex-1"></div>
                <button
                  onclick="reorderService('${order.service}')"
                  class="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                >
                  ${renderIcon("rotate-ccw", "text-primary", 12)}
                  Reorder
                </button>
              </div>
            `
            }
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

function setOrdersTab(tab) {
  state.orders.activeTab = tab;
  render();
}

function toggleActiveOrderDetail() {
  state.orders.showActiveDetail = !state.orders.showActiveDetail;
  render();
}

function setExpandedTimelineStep(idx) {
  state.orders.expandedStepIndex = state.orders.expandedStepIndex === idx ? null : idx;
  render();
}

function setRatingOrder(orderId) {
  state.orders.ratingOrderId = orderId;
  state.orders.hoverRating = 0;
  render();
}

function setHoverRating(rating) {
  state.orders.hoverRating = rating;
  render();
}

async function submitOrderRating(orderId, rating) {
  try {
    await API.rateOrder(orderId, rating);
    showToast(`Thank you for your ${rating}★ rating!`);
    state.orders.ratingOrderId = null;
    await fetchUserData();
    render();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function reorderService(serviceName) {
  const match = state.services.find((s) => serviceName.includes(s.name)) || state.services[0];
  state.booking.selectedServiceIds = [match.id];
  state.booking.currentStep = 0;
  navigate("/booking");
}

// ============================================================================
// SCREEN 6: PROFILE (#/profile)
// ============================================================================

function renderProfile() {
  const p = state.profile;
  const user = API.getUser() || state.currentUser || { name: "Alex Johnson", email: "alex@email.com", role: "CUSTOMER" };
  const isAdmin = user && user.role === "ADMIN";
  const profileData = p.data || {
    loyaltyPoints: 1250,
    hasActiveSubscription: true,
    subscriptionNextBilling: "Apr 15, 2026",
    cleaningsLeft: 1,
    notificationsEnabled: true,
    darkModeEnabled: true,
    totalOrders: 12,
    memberSince: "Jan '25",
  };

  const addresses = p.addresses || [];

  const customerStats = [
    { label: "Total Orders", value: profileData.totalOrders || "12", icon: "sparkles" },
    { label: "Member Since", value: profileData.memberSince || "Jan '25", icon: "award" },
    { label: "Points", value: (profileData.loyaltyPoints || 1250).toLocaleString(), icon: "crown" },
  ];

  const adminStats = [
    { label: "Managed Orders", value: adminOrdersList.length || "24", icon: "clipboard-list" },
    { label: "Staff Role", value: "Super Admin", icon: "shield" },
    { label: "Satisfaction", value: "4.9 ★", icon: "star" },
  ];

  const stats = isAdmin ? adminStats : customerStats;

  return `
    <div class="w-full min-h-screen md:pl-[260px] pb-28 md:pb-12">
      <div class="max-w-md md:max-w-[1100px] mx-auto px-5 md:px-8 pt-8 md:pt-10 space-y-6">
        <div class="flex items-center justify-between">
          <h1 class="text-2xl md:text-3xl font-display font-bold">Profile</h1>
          ${
            !p.isEditing
              ? `
            <button
              onclick="startProfileEdit('${user.name}', '${user.email}')"
              class="flex items-center gap-1.5 text-xs text-primary font-medium px-3 py-1.5 rounded-full glass-card hover:border-primary/30 transition-all"
            >
              ${renderIcon("edit-3", "text-primary", 12)} Edit
            </button>
          `
              : `
            <div class="flex gap-2">
              <button
                onclick="cancelProfileEdit()"
                class="p-2 rounded-full glass-card text-muted-foreground hover:text-destructive transition-colors"
              >
                ${renderIcon("x", "text-muted-foreground", 14)}
              </button>
              <button
                onclick="saveProfileEdit()"
                class="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
              >
                ${renderIcon("check", "text-primary", 14)}
              </button>
            </div>
          `
          }
        </div>

        <!-- 2 Columns on Desktop: User, Stats & Operations/Subscription on Left; Addresses & Settings on Right -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <!-- Left Column: User Card, Stats, Operations/Subscription -->
          <div class="space-y-6">
            <!-- User Card -->
            <div class="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center relative">
                ${renderIcon(isAdmin ? "shield-check" : "user", "text-primary", 28)}
                ${
                  p.isEditing
                    ? `
                  <div class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center cursor-pointer">
                    ${renderIcon("edit-3", "text-primary-foreground", 10)}
                  </div>
                `
                    : ""
                }
              </div>
              <div class="flex-1">
                ${
                  p.isEditing
                    ? `
                  <div class="space-y-2">
                    <input
                      id="profile-edit-name"
                      value="${p.editName}"
                      class="w-full bg-secondary rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      id="profile-edit-email"
                      value="${p.editEmail}"
                      class="w-full bg-secondary rounded-lg px-3 py-1.5 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                `
                    : `
                  <h2 class="font-display font-semibold text-lg">${user.name}</h2>
                  <p class="text-sm text-muted-foreground">${user.email}</p>
                  <div class="flex items-center gap-1.5 mt-1">
                    ${renderIcon(isAdmin ? "shield-check" : "crown", "text-primary", 13)}
                    <span class="text-xs text-primary font-medium">${isAdmin ? "Super Administrator (Staff)" : "Premium Member"}</span>
                  </div>
                `
                }
              </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-3">
              ${stats
                .map(
                  ({ label, value, icon }) => `
                <div class="glass-card rounded-2xl p-3 text-center">
                  ${renderIcon(icon, "text-primary mx-auto mb-1.5", 16)}
                  <p class="text-base font-display font-bold">${value}</p>
                  <p class="text-[10px] text-muted-foreground">${label}</p>
                </div>
              `
                )
                .join("")}
            </div>

            ${
              !isAdmin
                ? `
              <!-- Subscription Card for Customers -->
              <div class="glass-card rounded-2xl p-5 border-primary/20 space-y-3">
                <div class="flex justify-between items-center">
                  <div>
                    <p class="font-display font-semibold text-sm">Monthly Plan</p>
                    <p class="text-xs text-muted-foreground">Next billing: ${profileData.subscriptionNextBilling || "Apr 15, 2026"}</p>
                  </div>
                  <span class="text-lg font-display font-bold gradient-text">$29/mo</span>
                </div>
                <div class="flex gap-2">
                  <div class="flex-1 bg-secondary rounded-xl p-3 text-center">
                    <p class="text-lg font-display font-bold">${profileData.cleaningsLeft || 1}</p>
                    <p class="text-[10px] text-muted-foreground">Cleanings Left</p>
                  </div>
                  <div class="flex-1 bg-secondary rounded-xl p-3 text-center">
                    <p class="text-lg font-display font-bold">20%</p>
                    <p class="text-[10px] text-muted-foreground">Discount</p>
                  </div>
                </div>
                <button
                  onclick="subscribeMonthlyPlan()"
                  class="w-full glass-card py-2.5 rounded-xl text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  Manage Subscription
                </button>
              </div>
            `
                : `
              <!-- Operations Command Center Quick Access for Admins (Zero Buying Options) -->
              <div class="glass-card rounded-2xl p-5 border-primary/20 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-display font-semibold text-sm">Admin Operations Console</p>
                    <p class="text-xs text-muted-foreground">Live Cloud Production • Neon DB Connected</p>
                  </div>
                  <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">Active</span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onclick="setAdminTab('orders')"
                    class="glass-card p-3 rounded-xl hover:border-primary/40 flex items-center gap-2.5 transition-all text-left"
                  >
                    ${renderIcon("clipboard-list", "text-primary shrink-0", 16)}
                    <div>
                      <p class="font-semibold text-foreground">Live Orders</p>
                      <p class="text-[10px] text-muted-foreground">Status & tracking</p>
                    </div>
                  </button>
                  <button
                    onclick="setAdminTab('reviews')"
                    class="glass-card p-3 rounded-xl hover:border-primary/40 flex items-center gap-2.5 transition-all text-left"
                  >
                    ${renderIcon("star", "text-amber-400 shrink-0", 16)}
                    <div>
                      <p class="font-semibold text-foreground">Reviews QA</p>
                      <p class="text-[10px] text-muted-foreground">Moderation & replies</p>
                    </div>
                  </button>
                  <button
                    onclick="setAdminTab('support')"
                    class="glass-card p-3 rounded-xl hover:border-primary/40 flex items-center gap-2.5 transition-all text-left col-span-2"
                  >
                    ${renderIcon("truck", "text-primary shrink-0", 16)}
                    <div>
                      <p class="font-semibold text-foreground">Support & Fleet Dispatch</p>
                      <p class="text-[10px] text-muted-foreground">Courier routes & customer tickets</p>
                    </div>
                  </button>
                </div>

                <button
                  onclick="navigate('/admin')"
                  class="w-full gradient-btn py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  ${renderIcon("shield-check", "text-primary-foreground", 14)}
                  <span>Open Operations Dashboard</span>
                </button>
              </div>
            `
            }
          </div>

          <!-- Right Column: Saved Addresses, Settings List, Sign Out -->
          <div class="space-y-6">
            <!-- Saved Addresses -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h2 class="font-display font-semibold text-base">Saved Addresses</h2>
                <button onclick="promptAddNewAddress()" class="text-xs text-primary font-medium">+ Add New</button>
              </div>
              ${addresses
                .map((addr) => {
                  const isExpanded = p.expandedAddressId === addr.id;
                  return `
                  <button
                    onclick="toggleAddressExpand(${addr.id})"
                    class="w-full glass-card rounded-2xl p-4 text-left transition-all hover:border-primary/30 active:scale-[0.98]"
                  >
                    <div class="flex items-center gap-3">
                      ${renderIcon("map-pin", "text-primary shrink-0", 16)}
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-medium">${addr.label}</span>
                          ${addr.isDefault ? `<span class="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">Default</span>` : ""}
                        </div>
                        <p class="text-xs text-muted-foreground">${addr.street}, ${addr.city}</p>
                      </div>
                      ${renderIcon("chevron-right", `text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`, 14)}
                    </div>
                    ${
                      isExpanded
                        ? `
                      <div class="mt-3 pt-3 border-t border-border flex gap-2 animate-fade-in" onclick="event.stopPropagation()">
                        <span onclick="editSavedAddress(${addr.id})" class="text-xs text-primary font-medium cursor-pointer">Edit</span>
                        <span class="text-xs text-muted-foreground">•</span>
                        <span onclick="setDefaultSavedAddress(${addr.id})" class="text-xs text-muted-foreground cursor-pointer">${
                            addr.isDefault ? "Default address" : "Set as default"
                          }</span>
                        <span class="text-xs text-muted-foreground">•</span>
                        <span onclick="removeSavedAddress(${addr.id})" class="text-xs text-destructive cursor-pointer">Remove</span>
                      </div>
                    `
                        : ""
                    }
                  </button>
                `;
                })
                .join("")}
            </div>

            <!-- Settings List -->
            <div class="glass-card rounded-2xl overflow-hidden divide-y divide-border">
              <!-- Notifications Toggle -->
              <div class="px-5 py-4 flex items-center gap-4">
                ${renderIcon("bell", "text-muted-foreground", 18)}
                <span class="flex-1 text-sm">Notifications</span>
                <button
                  onclick="toggleNotificationSetting()"
                  class="w-11 h-6 rounded-full transition-all relative ${profileData.notificationsEnabled ? "bg-primary" : "bg-secondary"}"
                >
                  <div
                    class="w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-all ${
                      profileData.notificationsEnabled ? "left-[22px]" : "left-0.5"
                    }"
                  ></div>
                </button>
              </div>

              <!-- Dark Mode Toggle -->
              <div class="px-5 py-4 flex items-center gap-4">
                ${renderIcon("palette", "text-muted-foreground", 18)}
                <span class="flex-1 text-sm">Dark Mode</span>
                <button
                  onclick="toggleDarkModeSetting()"
                  class="w-11 h-6 rounded-full transition-all relative ${profileData.darkModeEnabled ? "bg-primary" : "bg-secondary"}"
                >
                  <div
                    class="w-5 h-5 rounded-full bg-foreground absolute top-0.5 transition-all ${
                      profileData.darkModeEnabled ? "left-[22px]" : "left-0.5"
                    }"
                  ></div>
                </button>
              </div>

              <!-- Links -->
              <button
                onclick="navigate('/orders')"
                class="w-full px-5 py-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors"
              >
                ${renderIcon("clock", "text-muted-foreground", 18)}
                <span class="flex-1 text-sm text-left">Order History</span>
                ${renderIcon("chevron-right", "text-muted-foreground", 16)}
              </button>

              <button
                onclick="showToast('Privacy & Security details: All data encrypted with SSL/TLS.')"
                class="w-full px-5 py-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors"
              >
                ${renderIcon("shield", "text-muted-foreground", 18)}
                <span class="flex-1 text-sm text-left">Privacy & Security</span>
                ${renderIcon("chevron-right", "text-muted-foreground", 16)}
              </button>

              <button
                onclick="showToast('Support: contact support@sneakerspa.com or call 1-800-SNK-CARE')"
                class="w-full px-5 py-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors"
              >
                ${renderIcon("help-circle", "text-muted-foreground", 18)}
                <span class="flex-1 text-sm text-left">Help & Support</span>
                ${renderIcon("chevron-right", "text-muted-foreground", 16)}
              </button>

              ${
                user.role === "ADMIN"
                  ? `
                <button
                  onclick="navigate('/admin')"
                  class="w-full px-5 py-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors bg-primary/10"
                >
                  ${renderIcon("settings", "text-primary", 18)}
                  <span class="flex-1 text-sm text-left font-semibold text-primary">Admin Dashboard</span>
                  ${renderIcon("chevron-right", "text-primary", 16)}
                </button>
              `
                  : ""
              }
            </div>

            <!-- Sign Out -->
            <button
              onclick="handleSignOut()"
              class="w-full glass-card rounded-2xl py-4 flex items-center justify-center gap-2 text-destructive font-medium text-sm hover:bg-destructive/10 active:scale-[0.97] transition-all"
            >
              ${renderIcon("log-out", "text-destructive", 16)}
              Sign Out
            </button>

            <p class="text-center text-[10px] text-muted-foreground pb-4">Sneaker Spa v1.0 • Made with ❤️</p>
          </div>
        </div>
      </div>
      ${renderBottomNav()}
    </div>
  `;
}

function startProfileEdit(name, email) {
  state.profile.isEditing = true;
  state.profile.editName = name;
  state.profile.editEmail = email;
  render();
}

function cancelProfileEdit() {
  state.profile.isEditing = false;
  render();
}

async function saveProfileEdit() {
  const nameInput = document.getElementById("profile-edit-name");
  const emailInput = document.getElementById("profile-edit-email");
  const newName = nameInput ? nameInput.value.trim() : state.profile.editName;
  const newEmail = emailInput ? emailInput.value.trim() : state.profile.editEmail;

  try {
    const updated = await API.updateProfile({ name: newName, email: newEmail });
    state.profile.data = updated;
    state.currentUser = { id: updated.id, name: updated.name, email: updated.email, role: updated.role };
    API.setUser(state.currentUser);
    state.profile.isEditing = false;
    showToast("Profile saved successfully!");
    render();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function toggleAddressExpand(addrId) {
  state.profile.expandedAddressId = state.profile.expandedAddressId === addrId ? null : addrId;
  render();
}

async function promptAddNewAddress() {
  const label = prompt("Address Label (e.g. Home, Office):", "Home");
  if (!label) return;
  const street = prompt("Street Address:", "123 Main St");
  if (!street) return;
  const city = prompt("City:", "New York");
  const zip = prompt("ZIP Code:", "10001");

  try {
    await API.addAddress({ label, street, city: city || "New York", zip: zip || "10001", isDefault: false });
    showToast("Address added!");
    await fetchUserData();
    render();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function editSavedAddress(id) {
  const current = state.profile.addresses.find((a) => a.id === id);
  if (!current) return;
  const street = prompt("Update street address:", current.street);
  if (!street) return;

  try {
    await API.updateAddress(id, { ...current, street });
    showToast("Address updated!");
    await fetchUserData();
    render();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function removeSavedAddress(id) {
  if (!confirm("Are you sure you want to remove this address?")) return;
  try {
    await API.deleteAddress(id);
    showToast("Address removed");
    await fetchUserData();
    render();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function setDefaultSavedAddress(id) {
  try {
    await API.setDefaultAddress(id);
    showToast("Default address updated!");
    await fetchUserData();
    render();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function toggleNotificationSetting() {
  if (!state.profile.data) return;
  const current = state.profile.data.notificationsEnabled;
  try {
    const updated = await API.updateProfile({ notificationsEnabled: !current });
    state.profile.data = updated;
    showToast(`Notifications ${!current ? "enabled" : "disabled"}`);
    render();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function toggleDarkModeSetting() {
  if (!state.profile.data) return;
  const current = state.profile.data.darkModeEnabled;
  try {
    const updated = await API.updateProfile({ darkModeEnabled: !current });
    state.profile.data = updated;
    showToast(`Dark mode preferences saved`);
    render();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function handleSignOut() {
  API.logout();
  showToast("Signed out successfully");
  navigate("/");
}

// ============================================================================
// SCREEN 7: NOT FOUND (#/404 or any unknown hash)
// ============================================================================

function renderNotFound() {
  return `
    <div class="flex min-h-screen items-center justify-center bg-muted/20">
      <div class="text-center p-6 glass-card rounded-2xl max-w-sm mx-4">
        <h1 class="mb-4 text-4xl font-bold font-display">404</h1>
        <p class="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <button onclick="navigate('/home')" class="gradient-btn px-6 py-3 rounded-xl text-sm font-semibold">
          Return to Home
        </button>
      </div>
    </div>
  `;
}

// ============================================================================
// SCREEN 8: ADMIN OPERATIONS DASHBOARD (#/admin)
// ============================================================================

let adminOrdersList = [];

async function renderAdmin() {
  const user = API.getUser() || state.currentUser;
  if (user) state.currentUser = user;
  if (!user || user.role !== "ADMIN") {
    return `
      <div class="w-full min-h-screen md:pl-[260px] pb-28 md:pb-12 flex items-center justify-center">
        <div class="max-w-md mx-auto px-5 text-center space-y-4">
          <div class="w-14 h-14 rounded-2xl bg-destructive/20 text-destructive flex items-center justify-center mx-auto">
            ${renderIcon("shield-alert", "text-destructive", 28)}
          </div>
          <h2 class="text-xl font-display font-bold text-destructive">Admin Access Required</h2>
          <p class="text-xs text-muted-foreground">You must be logged in as an administrator to access the Operations Dashboard.</p>
          <button onclick="openAuthModal('login')" class="gradient-btn px-6 py-2.5 rounded-xl text-xs font-semibold">
            Login as Admin
          </button>
          ${renderBottomNav()}
        </div>
      </div>
    `;
  }

  // Fetch admin orders and ensure reviews are loaded
  try {
    adminOrdersList = await API.getAdminOrders();
  } catch {
    if (!adminOrdersList) {
      adminOrdersList = [];
    }
  }

  if (!state.reviews || state.reviews.length === 0) {
    try {
      state.reviews = await API.getReviews();
    } catch {
      state.reviews = [];
    }
  }

  // Calculate Operational KPIs
  const totalOrders = adminOrdersList.length;
  let totalRevenue = 0;
  let activeQueue = 0;
  for (const o of adminOrdersList) {
    const rawVal = parseFloat((o.price || "$0").replace(/[^0-9.]/g, "")) || 0;
    totalRevenue += rawVal;
    if (!["DELIVERED", "CANCELLED"].includes(o.rawStatus)) {
      activeQueue++;
    }
  }
  const avgSatisfaction = 4.9;
  const openTicketsCount = state.admin.supportTickets.filter((t) => t.status === "OPEN").length;
  const currentTab = state.admin.activeTab || "orders";

  return `
    <div class="w-full min-h-screen md:pl-[260px] pb-28 md:pb-12">
      <div class="max-w-md md:max-w-[1100px] mx-auto px-5 md:px-8 pt-8 md:pt-10 space-y-6">
        
        <!-- Header & Top Actions -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Operations Live
              </span>
              <span class="text-[11px] text-muted-foreground">• Neon Cloud DB</span>
            </div>
            <h1 class="text-2xl md:text-3xl font-display font-bold mt-1">Operations Dashboard</h1>
            <p class="text-xs text-muted-foreground mt-0.5">Real-time order fulfillment, customer reviews moderation, and courier fleet dispatch.</p>
          </div>

          <div class="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onclick="refreshAdminDashboard()"
              class="glass-card hover:border-primary/40 px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 text-foreground/80 hover:text-primary transition-all active:scale-[0.98]"
            >
              ${renderIcon("refresh-cw", "text-primary", 14)}
              <span>Sync Cloud</span>
            </button>
            <button
              onclick="navigate('/home')"
              class="glass-card hover:border-primary/40 px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 text-foreground/80 hover:text-primary transition-all active:scale-[0.98]"
            >
              ${renderIcon("external-link", "text-muted-foreground", 14)}
              <span>Storefront</span>
            </button>
          </div>
        </div>

        <!-- 4 Top KPI Metric Cards (No consumer sales options) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
          <!-- KPI 1: Orders -->
          <div class="glass-card rounded-2xl p-4 space-y-1 relative overflow-hidden group hover:border-primary/40 transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Total Orders</span>
              <div class="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                ${renderIcon("clipboard-list", "text-primary", 16)}
              </div>
            </div>
            <p class="text-2xl font-display font-bold">${totalOrders}</p>
            <p class="text-[11px] text-muted-foreground">All customer bookings</p>
          </div>

          <!-- KPI 2: Gross Revenue -->
          <div class="glass-card rounded-2xl p-4 space-y-1 relative overflow-hidden group hover:border-primary/40 transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Gross Revenue</span>
              <div class="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                ${renderIcon("dollar-sign", "text-emerald-400", 16)}
              </div>
            </div>
            <p class="text-2xl font-display font-bold gradient-text">$${totalRevenue.toFixed(2)}</p>
            <p class="text-[11px] text-emerald-400/90 font-medium">Synced from Database</p>
          </div>

          <!-- KPI 3: In-Flight Queue -->
          <div class="glass-card rounded-2xl p-4 space-y-1 relative overflow-hidden group hover:border-primary/40 transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Active Queue</span>
              <div class="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                ${renderIcon("clock", "text-amber-400", 16)}
              </div>
            </div>
            <p class="text-2xl font-display font-bold">${activeQueue}</p>
            <p class="text-[11px] text-amber-400/90 font-medium">In cleaning or transit</p>
          </div>

          <!-- KPI 4: Customer Satisfaction -->
          <div class="glass-card rounded-2xl p-4 space-y-1 relative overflow-hidden group hover:border-primary/40 transition-all">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Satisfaction</span>
              <div class="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                ${renderIcon("star", "text-amber-400", 16)}
              </div>
            </div>
            <p class="text-2xl font-display font-bold text-amber-400">${avgSatisfaction} ★</p>
            <p class="text-[11px] text-muted-foreground">${state.reviews.length || 18} verified reviews</p>
          </div>
        </div>

        <!-- 3 Operational Tabs Switcher -->
        <div class="glass-card p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onclick="setAdminTab('orders')"
            class="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
              currentTab === "orders"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }"
          >
            ${renderIcon("clipboard-list", currentTab === "orders" ? "text-primary-foreground" : "text-muted-foreground", 16)}
            <span>Customer Orders</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full ${currentTab === "orders" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"}">${totalOrders}</span>
          </button>

          <button
            onclick="setAdminTab('reviews')"
            class="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
              currentTab === "reviews"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }"
          >
            ${renderIcon("star", currentTab === "reviews" ? "text-primary-foreground" : "text-muted-foreground", 16)}
            <span>Customer Reviews</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full ${currentTab === "reviews" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"}">${state.reviews.length}</span>
          </button>

          <button
            onclick="setAdminTab('support')"
            class="flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${
              currentTab === "support"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }"
          >
            ${renderIcon("truck", currentTab === "support" ? "text-primary-foreground" : "text-muted-foreground", 16)}
            <span>Support & Dispatch</span>
            ${
              openTicketsCount > 0
                ? `<span class="text-[10px] px-1.5 py-0.2 rounded-full ${currentTab === "support" ? "bg-destructive text-destructive-foreground" : "bg-destructive/20 text-destructive font-bold"}">${openTicketsCount}</span>`
                : ""
            }
          </button>
        </div>

        <!-- TAB CONTENT -->
        ${
          currentTab === "orders"
            ? renderAdminOrdersTab()
            : currentTab === "reviews"
            ? renderAdminReviewsTab()
            : renderAdminSupportTab()
        }

      </div>

      <!-- Photo Condition Modal -->
      ${renderAdminPhotoModal()}

      ${renderBottomNav()}
    </div>
  `;
}

function getStatusBadgeClass(status) {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
    case "CANCELLED":
      return "bg-destructive/20 text-destructive border border-destructive/30";
    case "CLEANING":
      return "bg-primary/20 text-primary border border-primary/30";
    case "QUALITY_CHECK":
      return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
    case "OUT_FOR_DELIVERY":
      return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
    case "PICKED_UP":
    case "PICKUP_SCHEDULED":
      return "bg-sky-500/20 text-sky-400 border border-sky-500/30";
    default:
      return "bg-primary/20 text-primary border border-primary/30";
  }
}

function renderAdminOrdersTab() {
  const statuses = ["PLACED", "PICKUP_SCHEDULED", "PICKED_UP", "CLEANING", "QUALITY_CHECK", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

  const q = (state.admin.searchQuery || "").trim().toLowerCase();
  const f = state.admin.statusFilter || "ALL";

  const filteredOrders = adminOrdersList.filter((order) => {
    const matchQ =
      !q ||
      (order.id && order.id.toLowerCase().includes(q)) ||
      (order.customerName && order.customerName.toLowerCase().includes(q)) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(q)) ||
      (order.service && order.service.toLowerCase().includes(q));

    if (!matchQ) return false;

    if (f === "ACTIVE") return !["DELIVERED", "CANCELLED"].includes(order.rawStatus);
    if (f === "CLEANING") return order.rawStatus === "CLEANING";
    if (f === "DELIVERY") return ["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.rawStatus);
    if (f === "DELIVERED") return order.rawStatus === "DELIVERED";
    return true;
  });

  return `
    <div class="space-y-4">
      <!-- Search & Status Filter Chips -->
      <div class="glass-card rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <!-- Search Input -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            ${renderIcon("search", "text-muted-foreground", 16)}
          </div>
          <input
            type="text"
            value="${state.admin.searchQuery || ""}"
            oninput="setAdminSearchQuery(this.value)"
            placeholder="Search by order #, customer name, email, or service..."
            class="w-full bg-secondary text-xs rounded-xl pl-9 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
          />
          ${
            state.admin.searchQuery
              ? `
            <button onclick="setAdminSearchQuery('')" class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground">
              ${renderIcon("x", "text-muted-foreground", 14)}
            </button>
          `
              : ""
          }
        </div>

        <!-- Filter Chips -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          ${[
            { id: "ALL", label: `All (${adminOrdersList.length})` },
            { id: "ACTIVE", label: "Active Queue" },
            { id: "CLEANING", label: "Cleaning" },
            { id: "DELIVERY", label: "Transit" },
            { id: "DELIVERED", label: "Delivered" },
          ]
            .map(
              (chip) => `
            <button
              onclick="setAdminStatusFilter('${chip.id}')"
              class="px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                f === chip.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/20"
                  : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }"
            >
              ${chip.label}
            </button>
          `
            )
            .join("")}
        </div>
      </div>

      <!-- Order List or Table -->
      ${
        filteredOrders.length === 0
          ? `
        <div class="glass-card rounded-2xl p-10 text-center space-y-3">
          <div class="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto text-muted-foreground">
            ${renderIcon("inbox", "text-muted-foreground", 24)}
          </div>
          <h3 class="font-display font-semibold text-sm">No Orders Found</h3>
          <p class="text-xs text-muted-foreground">No orders match the current search query or filter criteria.</p>
          <button onclick="setAdminSearchQuery(''); setAdminStatusFilter('ALL');" class="text-xs text-primary font-semibold hover:underline">
            Reset Filters
          </button>
        </div>
      `
          : `
        <!-- Mobile Card Layout (< 768px) -->
        <div class="space-y-4 md:hidden">
          ${filteredOrders
            .map(
              (order) => `
            <div class="glass-card rounded-2xl p-4 space-y-3">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-display font-bold text-sm">#${order.id}</p>
                  <p class="text-xs font-semibold text-foreground">${order.service}</p>
                  <p class="text-[11px] text-muted-foreground">${order.customerName || "Customer"} • ${order.customerEmail || ""}</p>
                </div>
                <span class="text-xs px-2.5 py-1 rounded-full ${getStatusBadgeClass(order.rawStatus)} font-medium">
                  ${order.status}
                </span>
              </div>

              <!-- Details & Photos -->
              <div class="text-xs text-muted-foreground bg-secondary/50 p-2.5 rounded-xl space-y-1.5">
                <p class="flex items-center gap-1.5">
                  ${renderIcon("map-pin", "text-primary shrink-0", 13)}
                  <span class="text-foreground truncate">${order.pickupAddress}</span>
                </p>
                <div class="flex justify-between items-center text-[11px]">
                  <span>Total: <strong class="text-foreground">${order.price}</strong></span>
                  <span>${order.date} • ${order.scheduledTime || ""}</span>
                </div>
                ${
                  order.photoUrls && order.photoUrls.length > 0
                    ? `
                  <div class="pt-1.5 border-t border-border/40 flex items-center justify-between">
                    <span class="text-[11px] text-primary flex items-center gap-1 font-medium">
                      ${renderIcon("camera", "text-primary", 12)} ${order.photoUrls.length} Condition Photo(s)
                    </span>
                    <button
                      onclick="openOrderPhotosModal('${order.id}')"
                      class="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-md font-semibold hover:bg-primary/30"
                    >
                      View Photos
                    </button>
                  </div>
                `
                    : ""
                }
              </div>

              <!-- Status Update Controls -->
              <div class="space-y-2 pt-1 border-t border-border">
                <div class="flex items-center gap-2">
                  <select id="status-select-${order.id}" class="flex-1 bg-secondary text-xs rounded-lg px-2.5 py-2 border border-border focus:ring-1 focus:ring-primary focus:outline-none">
                    ${statuses
                      .map(
                        (s) => `
                      <option value="${s}" ${order.rawStatus === s ? "selected" : ""}>${s}</option>
                    `
                      )
                      .join("")}
                  </select>
                  <button
                    onclick="advanceOrderStatus('${order.id}')"
                    class="gradient-btn px-4 py-2 rounded-lg text-xs font-semibold"
                  >
                    Update
                  </button>
                </div>
                <input
                  id="status-notes-${order.id}"
                  type="text"
                  placeholder="Optional timeline note (e.g. Sole iced, awaiting courier)..."
                  class="w-full bg-secondary text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
          `
            )
            .join("")}
        </div>

        <!-- Desktop Full-Width Table Layout (>= 768px) -->
        <div class="hidden md:block glass-card rounded-2xl overflow-hidden border border-border">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-secondary/70 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                <tr>
                  <th class="py-3.5 px-4">Order #</th>
                  <th class="py-3.5 px-4">Customer</th>
                  <th class="py-3.5 px-4">Service & Photos</th>
                  <th class="py-3.5 px-4">Total</th>
                  <th class="py-3.5 px-4">Scheduled</th>
                  <th class="py-3.5 px-4">Pickup Address</th>
                  <th class="py-3.5 px-4">Status</th>
                  <th class="py-3.5 px-4 min-w-[260px]">Update Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border/60">
                ${filteredOrders
                  .map(
                    (order) => `
                  <tr class="hover:bg-secondary/30 transition-colors">
                    <td class="py-3.5 px-4 font-mono font-bold text-foreground">
                      #${order.id}
                    </td>
                    <td class="py-3.5 px-4">
                      <p class="font-medium text-foreground">${order.customerName || "Customer"}</p>
                      <p class="text-[11px] text-muted-foreground">${order.customerEmail || ""}</p>
                    </td>
                    <td class="py-3.5 px-4">
                      <p class="font-medium text-foreground">${order.service}</p>
                      ${
                        order.photoUrls && order.photoUrls.length > 0
                          ? `
                        <button
                          onclick="openOrderPhotosModal('${order.id}')"
                          class="mt-1 inline-flex items-center gap-1 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded font-medium hover:bg-primary/30 transition-colors"
                        >
                          ${renderIcon("camera", "text-primary", 11)} ${order.photoUrls.length} Photos
                        </button>
                      `
                          : ""
                      }
                    </td>
                    <td class="py-3.5 px-4 font-display font-bold gradient-text">${order.price}</td>
                    <td class="py-3.5 px-4 text-muted-foreground">
                      <p class="text-foreground font-medium">${order.date}</p>
                      <p class="text-[10px]">${order.scheduledTime || ""}</p>
                    </td>
                    <td class="py-3.5 px-4 text-muted-foreground max-w-[160px] truncate" title="${order.pickupAddress}">
                      ${order.pickupAddress}
                    </td>
                    <td class="py-3.5 px-4">
                      <span class="inline-block px-2.5 py-1 rounded-full text-[11px] font-medium ${getStatusBadgeClass(order.rawStatus)}">
                        ${order.status}
                      </span>
                    </td>
                    <td class="py-3.5 px-4">
                      <div class="flex items-center gap-2">
                        <select id="status-select-table-${order.id}" class="bg-secondary text-xs rounded-lg px-2.5 py-1.5 border border-border focus:ring-1 focus:ring-primary focus:outline-none">
                          ${statuses
                            .map(
                              (s) => `
                            <option value="${s}" ${order.rawStatus === s ? "selected" : ""}>${s}</option>
                          `
                            )
                            .join("")}
                        </select>
                        <button
                          onclick="advanceOrderStatus('${order.id}')"
                          class="gradient-btn px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
                        >
                          Update
                        </button>
                      </div>
                      <input
                        id="status-notes-table-${order.id}"
                        type="text"
                        placeholder="Timeline note (e.g. Sole sanitized)..."
                        class="w-full mt-1.5 bg-secondary text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                      />
                    </td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      `
      }
    </div>
  `;
}

function renderAdminReviewsTab() {
  const reviews = state.reviews || [];

  return `
    <div class="space-y-6">
      <!-- Reviews Analytics Summary Card -->
      <div class="glass-card rounded-2xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <!-- Score -->
        <div class="text-center md:text-left space-y-1">
          <p class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Overall Satisfaction</p>
          <div class="flex items-center justify-center md:justify-start gap-2">
            <span class="text-4xl font-display font-bold text-amber-400">4.9</span>
            <div class="flex text-amber-400">
              ${[1, 2, 3, 4, 5].map(() => renderIcon("star", "text-amber-400 fill-amber-400", 18)).join("")}
            </div>
          </div>
          <p class="text-xs text-muted-foreground">Based on ${reviews.length || 18} authenticated sneaker cleanings</p>
        </div>

        <!-- Rating Distribution -->
        <div class="space-y-1.5">
          <div class="flex items-center gap-2 text-xs">
            <span class="w-10 text-muted-foreground font-medium">5 Star</span>
            <div class="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
              <div class="bg-primary h-full rounded-full" style="width: 92%"></div>
            </div>
            <span class="w-8 text-right text-foreground font-semibold">92%</span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="w-10 text-muted-foreground font-medium">4 Star</span>
            <div class="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
              <div class="bg-primary/60 h-full rounded-full" style="width: 6%"></div>
            </div>
            <span class="w-8 text-right text-foreground font-semibold">6%</span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="w-10 text-muted-foreground font-medium">3 Star</span>
            <div class="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
              <div class="bg-amber-400 h-full rounded-full" style="width: 2%"></div>
            </div>
            <span class="w-8 text-right text-foreground font-semibold">2%</span>
          </div>
        </div>

        <!-- QA Policy Badge -->
        <div class="bg-secondary/60 rounded-xl p-4 border border-border/80 space-y-1.5 text-xs">
          <div class="flex items-center gap-2 text-primary font-semibold">
            ${renderIcon("award", "text-primary", 16)}
            <span>Master Cobbler Guarantee</span>
          </div>
          <p class="text-muted-foreground text-[11px] leading-relaxed">
            All reviews originate from real orders verified by our workshop. Negative reports trigger instant courier dispatch inspection.
          </p>
        </div>
      </div>

      <!-- Reviews Moderation & Feedback Stream -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-display font-semibold text-base md:text-lg">Customer Feedback & QA Moderation</h2>
          <span class="text-xs text-muted-foreground">${reviews.length} Total Submissions</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${reviews
            .map((review) => {
              const isFeatured = !!state.admin.featuredReviews[review.id];
              const reply = state.admin.adminReplies[review.id];

              return `
              <div class="glass-card rounded-2xl p-5 space-y-3.5 flex flex-col justify-between hover:border-primary/40 transition-all ${
                isFeatured ? "border-primary/40 bg-primary/5" : ""
              }">
                <div class="space-y-3">
                  <!-- Header: Customer & Stars -->
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs">
                        ${review.name ? review.name.charAt(0).toUpperCase() : "C"}
                      </div>
                      <div>
                        <div class="flex items-center gap-1.5">
                          <p class="text-xs font-semibold text-foreground">${review.name}</p>
                          <span class="text-[9px] bg-primary/20 text-primary px-1.5 py-0.2 rounded-full font-semibold">Verified</span>
                        </div>
                        <p class="text-[10px] text-muted-foreground">${review.time || "Recent order"}</p>
                      </div>
                    </div>

                    <!-- Stars -->
                    <div class="flex text-amber-400">
                      ${[...Array(review.rating || 5)].map(() => renderIcon("star", "text-amber-400 fill-amber-400", 13)).join("")}
                    </div>
                  </div>

                  <!-- Text -->
                  <p class="text-xs text-foreground/90 leading-relaxed italic">
                    "${review.text}"
                  </p>

                  <!-- Helpful Count -->
                  <div class="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span class="flex items-center gap-1">
                      ${renderIcon("thumbs-up", "text-primary", 12)}
                      <span>${review.helpfulCount || 0} helpful votes</span>
                    </span>
                    ${
                      isFeatured
                        ? `<span class="text-primary font-semibold flex items-center gap-1">${renderIcon("sparkles", "text-primary", 12)} Pinned on Storefront</span>`
                        : ""
                    }
                  </div>

                  <!-- Official Staff Reply if exists -->
                  ${
                    reply
                      ? `
                    <div class="p-3 rounded-xl bg-secondary/80 border border-primary/20 space-y-1">
                      <div class="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                        ${renderIcon("shield-check", "text-primary", 12)}
                        <span>Official Spa Response</span>
                      </div>
                      <p class="text-xs text-muted-foreground leading-relaxed">
                        "${reply}"
                      </p>
                    </div>
                  `
                      : ""
                  }
                </div>

                <!-- Admin Action Toolbar -->
                <div class="pt-3 border-t border-border/60 flex flex-col gap-2">
                  <div class="flex items-center justify-between gap-2">
                    <button
                      onclick="toggleFeaturedReview(${review.id})"
                      class="px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isFeatured
                          ? "bg-primary/20 text-primary font-semibold border border-primary/30"
                          : "glass-card text-muted-foreground hover:text-foreground"
                      }"
                    >
                      ${renderIcon("star", isFeatured ? "text-primary fill-primary" : "text-muted-foreground", 13)}
                      <span>${isFeatured ? "Featured" : "Feature on Store"}</span>
                    </button>
                    <span class="text-[10px] text-muted-foreground">ID: REV-${review.id}</span>
                  </div>

                  <!-- Reply Box if no reply yet -->
                  ${
                    !reply
                      ? `
                    <div class="flex items-center gap-1.5 mt-1">
                      <input
                        id="admin-reply-input-${review.id}"
                        type="text"
                        placeholder="Post official staff reply..."
                        class="flex-1 bg-secondary text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/60"
                      />
                      <button
                        onclick="submitAdminReviewReply(${review.id})"
                        class="gradient-btn px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0"
                      >
                        Reply
                      </button>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderAdminSupportTab() {
  const tickets = state.admin.supportTickets || [];
  const drivers = state.admin.drivers || [];

  return `
    <div class="space-y-6">
      <!-- 2 Operational Columns: Dispatch Fleet & Support Tickets -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        <!-- Column 1: Courier Dispatch Fleet -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-display font-semibold text-base md:text-lg">Courier Fleet & Dispatch</h2>
              <p class="text-xs text-muted-foreground">Live courier vehicle tracking and active route load</p>
            </div>
            <span class="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider">
              3 Drivers Active
            </span>
          </div>

          <div class="space-y-3">
            ${drivers
              .map(
                (driver) => `
              <div class="glass-card rounded-2xl p-4 space-y-3 hover:border-primary/40 transition-all">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      ${renderIcon("truck", "text-primary", 20)}
                    </div>
                    <div>
                      <p class="font-display font-bold text-sm text-foreground">${driver.name}</p>
                      <p class="text-xs text-muted-foreground">${driver.vehicle}</p>
                    </div>
                  </div>
                  <span class="text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 ${
                    driver.status === "ON_ROUTE"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-primary/20 text-primary border border-primary/30"
                  }">
                    <span class="w-1.5 h-1.5 rounded-full ${driver.status === "ON_ROUTE" ? "bg-emerald-400 animate-pulse" : "bg-primary"}"></span>
                    ${driver.status === "ON_ROUTE" ? "On Route" : "Available"}
                  </span>
                </div>

                <!-- Route Stats -->
                <div class="grid grid-cols-3 gap-2 bg-secondary/50 p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <p class="font-display font-bold text-foreground">${driver.activeStops}</p>
                    <p class="text-[10px] text-muted-foreground">Active Stops</p>
                  </div>
                  <div>
                    <p class="font-display font-bold text-foreground">${driver.completedToday}</p>
                    <p class="text-[10px] text-muted-foreground">Completed</p>
                  </div>
                  <div>
                    <p class="font-display font-bold text-primary">${driver.etaNext}</p>
                    <p class="text-[10px] text-muted-foreground">Next ETA</p>
                  </div>
                </div>

                <!-- Footer & Action -->
                <div class="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
                  <span class="text-[11px] text-muted-foreground flex items-center gap-1">
                    ${renderIcon("map-pin", "text-muted-foreground", 12)}
                    ${driver.zone}
                  </span>
                  <a
                    href="tel:${driver.phone}"
                    class="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    ${renderIcon("phone", "text-primary", 12)} Call
                  </a>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

        <!-- Column 2: Customer Care & Support Tickets -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-display font-semibold text-base md:text-lg">Customer Inquiries & Support</h2>
              <p class="text-xs text-muted-foreground">Special care requests, doorman instructions & scheduling</p>
            </div>
            <span class="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary font-bold">
              ${tickets.filter((t) => t.status === "OPEN").length} Pending
            </span>
          </div>

          <div class="space-y-3">
            ${tickets
              .map(
                (ticket) => `
              <div class="glass-card rounded-2xl p-4 space-y-3 hover:border-primary/40 transition-all ${
                ticket.status === "OPEN" ? "border-amber-500/30" : "opacity-80"
              }">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono font-bold text-xs text-foreground">#${ticket.id}</span>
                      <span class="text-[9px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                        ticket.priority === "HIGH"
                          ? "bg-rose-500/20 text-rose-400"
                          : ticket.priority === "MEDIUM"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-sky-500/20 text-sky-400"
                      }">
                        ${ticket.priority} Priority
                      </span>
                    </div>
                    <p class="text-xs font-semibold text-foreground mt-0.5">${ticket.customer} (${ticket.email})</p>
                  </div>
                  <span class="text-[10px] text-muted-foreground">${ticket.time}</span>
                </div>

                <!-- Inquiry Box -->
                <div class="bg-secondary/60 p-3 rounded-xl text-xs space-y-1">
                  <p class="text-foreground/90 leading-relaxed">${ticket.issue}</p>
                  <p class="text-[10px] text-primary font-medium">Order Ref: #${ticket.orderId}</p>
                </div>

                <!-- Action Button -->
                <div class="flex items-center justify-between pt-1 border-t border-border/50">
                  <span class="text-[11px] font-medium ${ticket.status === "OPEN" ? "text-amber-400" : "text-emerald-400"} flex items-center gap-1">
                    ${renderIcon(ticket.status === "OPEN" ? "clock" : "check-circle-2", ticket.status === "OPEN" ? "text-amber-400" : "text-emerald-400", 13)}
                    Status: ${ticket.status}
                  </span>

                  ${
                    ticket.status === "OPEN"
                      ? `
                    <button
                      onclick="resolveSupportTicket('${ticket.id}')"
                      class="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      ${renderIcon("check", "text-emerald-400", 12)}
                      <span>Resolve Ticket</span>
                    </button>
                  `
                      : `
                    <span class="text-xs text-muted-foreground flex items-center gap-1">
                      ${renderIcon("check", "text-emerald-400", 12)} Resolved
                    </span>
                  `
                  }
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>

      </div>
    </div>
  `;
}

function renderAdminPhotoModal() {
  if (!state.admin.viewingPhotoOrderId) return "";
  const order = adminOrdersList.find((o) => o.id === state.admin.viewingPhotoOrderId);
  if (!order || !order.photoUrls || order.photoUrls.length === 0) return "";

  return `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in" onclick="closeOrderPhotosModal()">
      <div class="glass-card max-w-lg w-full rounded-3xl p-5 space-y-4 shadow-2xl border border-primary/30 animate-slide-up" onclick="event.stopPropagation()">
        <div class="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h3 class="font-display font-bold text-base text-foreground">Condition Inspection Photos</h3>
            <p class="text-xs text-muted-foreground">Order #${order.id} • ${order.customerName}</p>
          </div>
          <button onclick="closeOrderPhotosModal()" class="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground">
            ${renderIcon("x", "text-muted-foreground", 16)}
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          ${order.photoUrls
            .map(
              (url, idx) => `
            <div class="glass-card rounded-xl overflow-hidden border border-border group relative">
              <img src="${url}" alt="Condition Photo ${idx + 1}" class="w-full h-36 object-cover" />
              <div class="p-2 bg-secondary/80 text-[10px] text-muted-foreground">
                Photo #${idx + 1}
              </div>
            </div>
          `
            )
            .join("")}
        </div>

        <button onclick="closeOrderPhotosModal()" class="w-full gradient-btn py-2.5 rounded-xl text-xs font-semibold">
          Close Preview
        </button>
      </div>
    </div>
  `;
}

function setAdminTab(tabName) {
  if (state.admin) {
    state.admin.activeTab = tabName;
  }
  if (state.currentRoute !== "/admin") {
    navigate("/admin");
  } else {
    render();
  }
}

function setAdminSearchQuery(q) {
  if (state.admin) {
    state.admin.searchQuery = q;
  }
  render();
}

function setAdminStatusFilter(filter) {
  if (state.admin) {
    state.admin.statusFilter = filter;
  }
  render();
}

async function refreshAdminDashboard() {
  try {
    showToast("Synchronizing with cloud database...");
    adminOrdersList = await API.getAdminOrders();
    state.reviews = await API.getReviews().catch(() => state.reviews);
    render();
    showToast("Operations dashboard up to date.");
  } catch (err) {
    showToast("Failed to sync: " + err.message, "error");
  }
}

function resolveSupportTicket(ticketId) {
  const ticket = state.admin.supportTickets.find((t) => t.id === ticketId);
  if (ticket) {
    ticket.status = "RESOLVED";
    showToast(`Support Ticket #${ticketId} resolved.`);
    render();
  }
}

function toggleFeaturedReview(reviewId) {
  state.admin.featuredReviews[reviewId] = !state.admin.featuredReviews[reviewId];
  const isFeatured = state.admin.featuredReviews[reviewId];
  showToast(isFeatured ? "Review pinned as Featured on storefront." : "Review unpinned from storefront.");
  render();
}

function submitAdminReviewReply(reviewId) {
  const input = document.getElementById(`admin-reply-input-${reviewId}`);
  if (!input) return;
  const reply = input.value.trim();
  if (!reply) {
    showToast("Please enter an official response.", "error");
    return;
  }
  state.admin.adminReplies[reviewId] = reply;
  showToast("Official staff response published.");
  render();
}

function openOrderPhotosModal(orderId) {
  state.admin.viewingPhotoOrderId = orderId;
  render();
}

function closeOrderPhotosModal() {
  state.admin.viewingPhotoOrderId = null;
  render();
}

async function advanceOrderStatus(trackingNumber) {
  const select = document.getElementById(`status-select-table-${trackingNumber}`) || document.getElementById(`status-select-${trackingNumber}`);
  const notesInput = document.getElementById(`status-notes-table-${trackingNumber}`) || document.getElementById(`status-notes-${trackingNumber}`);
  const newStatus = select ? select.value : "CLEANING";
  const notes = notesInput ? notesInput.value.trim() : "";

  try {
    await API.updateAdminOrderStatus(trackingNumber, newStatus, notes);
    showToast(`Order #${trackingNumber} updated to ${newStatus}`);
    await fetchUserData();
    render();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ============================================================================
// AUTH MODAL (LOGIN & REGISTRATION)
// ============================================================================

function openAuthModal(tab = "login") {
  state.showAuthModal = true;
  state.authModalTab = tab;
  renderModal();
}

function closeAuthModal() {
  state.showAuthModal = false;
  renderModal();
}

function renderModal() {
  const container = document.getElementById("modal-container");
  if (!container) return;

  if (!state.showAuthModal) {
    container.innerHTML = "";
    container.className = "fixed inset-0 z-50 pointer-events-none";
    return;
  }

  container.className = "fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in";

  const isLogin = state.authModalTab === "login";

  container.innerHTML = `
    <div class="glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-primary/30 relative animate-slide-up" onclick="event.stopPropagation()">
      <button onclick="closeAuthModal()" class="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground">
        ${renderIcon("x", "text-muted-foreground", 16)}
      </button>

      <div class="text-center mb-6">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 mb-3">
          ${sparkleSvg}
          <span class="text-xs font-semibold text-primary">Sneaker Spa</span>
        </div>
        <h2 class="text-xl font-display font-bold">${isLogin ? "Welcome Back" : "Create Account"}</h2>
        <p class="text-xs text-muted-foreground mt-1">${isLogin ? "Sign in to track orders and rewards" : "Join the premium sneaker care club"}</p>
      </div>

      <!-- Tab Toggle -->
      <div class="flex gap-1 p-1 bg-secondary rounded-xl mb-5">
        <button
          onclick="state.authModalTab = 'login'; renderModal();"
          class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${isLogin ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"}"
        >
          Login
        </button>
        <button
          onclick="state.authModalTab = 'register'; renderModal();"
          class="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${!isLogin ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"}"
        >
          Sign Up
        </button>
      </div>

      <form onsubmit="handleAuthSubmit(event)" class="space-y-3">
        ${
          !isLogin
            ? `
          <div>
            <label class="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Full Name</label>
            <input
              id="auth-name"
              type="text"
              required
              placeholder="Alex Johnson"
              class="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        `
            : ""
        }

        <div>
          <label class="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Email</label>
          <input
            id="auth-email"
            type="email"
            required
            placeholder="alex@email.com"
            value="${isLogin ? "alex@email.com" : ""}"
            class="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label class="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Password</label>
          <input
            id="auth-password"
            type="password"
            required
            placeholder="••••••••"
            value="${isLogin ? "password123" : ""}"
            class="w-full bg-secondary rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          class="w-full gradient-btn py-3 rounded-xl font-display font-semibold text-sm active:scale-[0.97] transition-transform mt-4"
        >
          ${isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>

      <!-- Demo Accounts -->
      <div class="mt-5 pt-4 border-t border-border space-y-2">
        <p class="text-[10px] text-muted-foreground text-center">Quick Demo Accounts:</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            onclick="quickLogin('alex@email.com', 'password123')"
            class="glass-card py-2 px-3 rounded-xl text-xs font-medium hover:border-primary/40 active:scale-95 transition-all text-center"
          >
            Alex (Customer)
          </button>
          <button
            onclick="quickLogin('admin@sneakerspa.com', 'admin123')"
            class="glass-card py-2 px-3 rounded-xl text-xs font-medium hover:border-primary/40 active:scale-95 transition-all text-center text-primary"
          >
            Spa Admin
          </button>
        </div>
      </div>
    </div>
  `;

  lucide.createIcons({ root: container });
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const isLogin = state.authModalTab === "login";
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;

  try {
    if (isLogin) {
      await API.login(email, password);
      showToast("Signed in successfully!");
    } else {
      const name = document.getElementById("auth-name").value.trim();
      await API.register(name, email, password);
      showToast("Account created successfully! Welcome to Sneaker Spa.");
    }
    closeAuthModal();
    if (state.currentUser && state.currentUser.role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function quickLogin(email, password) {
  try {
    await API.login(email, password);
    showToast(`Signed in as ${email}!`);
    closeAuthModal();
    if (email.includes("admin") || (state.currentUser && state.currentUser.role === "ADMIN")) {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ============================================================================
// MAIN RENDER LOOP
// ============================================================================

async function render() {
  const app = document.getElementById("app");
  if (!app) return;

  const route = state.currentRoute;

  if (route === "/" || route === "") {
    app.innerHTML = renderOnboarding();
  } else if (route === "/home") {
    app.innerHTML = renderHome();
  } else if (route === "/services") {
    app.innerHTML = renderServices();
  } else if (route === "/booking") {
    app.innerHTML = renderBooking();
  } else if (route === "/orders") {
    app.innerHTML = renderOrders();
  } else if (route === "/profile") {
    app.innerHTML = renderProfile();
  } else if (route === "/admin") {
    const user = API.getUser() || state.currentUser;
    if (!user || user.role !== "ADMIN") {
      showToast("Access denied: Admin privileges required.", "error");
      setTimeout(() => navigate("/home"), 50);
      return;
    }
    state.currentUser = user;
    app.innerHTML = await renderAdmin();
  } else {
    app.innerHTML = renderNotFound();
  }

  // Hydrate Lucide SVG icons
  lucide.createIcons();
}

// Global window helpers so inline HTML onclicks can find functions
window.navigate = navigate;
window.setOnboardingSlide = setOnboardingSlide;
window.nextOnboardingSlide = nextOnboardingSlide;
window.handleOnboardingSkip = handleOnboardingSkip;
window.showToast = showToast;
window.setTransformation = setTransformation;
window.cycleTransformation = cycleTransformation;
window.toggleReviewLike = toggleReviewLike;
window.subscribeMonthlyPlan = subscribeMonthlyPlan;
window.setServiceFilter = setServiceFilter;
window.toggleServiceExpand = toggleServiceExpand;
window.toggleCompareService = toggleCompareService;
window.clearCompare = clearCompare;
window.bookServiceNow = bookServiceNow;
window.handleBookingBack = handleBookingBack;
window.handleBookingNext = handleBookingNext;
window.toggleBookingService = toggleBookingService;
window.toggleBookingAddon = toggleBookingAddon;
window.setBookingDate = setBookingDate;
window.setBookingTime = setBookingTime;
window.selectSavedAddress = selectSavedAddress;
window.useCurrentLocation = useCurrentLocation;
window.triggerPhotoUpload = triggerPhotoUpload;
window.handlePhotoFileSelected = handlePhotoFileSelected;
window.applyBookingPromo = applyBookingPromo;
window.removeBookingPromo = removeBookingPromo;
window.setOrdersTab = setOrdersTab;
window.toggleActiveOrderDetail = toggleActiveOrderDetail;
window.setExpandedTimelineStep = setExpandedTimelineStep;
window.setRatingOrder = setRatingOrder;
window.setHoverRating = setHoverRating;
window.submitOrderRating = submitOrderRating;
window.reorderService = reorderService;
window.startProfileEdit = startProfileEdit;
window.cancelProfileEdit = cancelProfileEdit;
window.saveProfileEdit = saveProfileEdit;
window.toggleAddressExpand = toggleAddressExpand;
window.promptAddNewAddress = promptAddNewAddress;
window.editSavedAddress = editSavedAddress;
window.removeSavedAddress = removeSavedAddress;
window.setDefaultSavedAddress = setDefaultSavedAddress;
window.toggleNotificationSetting = toggleNotificationSetting;
window.toggleDarkModeSetting = toggleDarkModeSetting;
window.handleSignOut = handleSignOut;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.handleAuthSubmit = handleAuthSubmit;
window.quickLogin = quickLogin;
window.advanceOrderStatus = advanceOrderStatus;
window.setAdminTab = setAdminTab;
window.setAdminSearchQuery = setAdminSearchQuery;
window.setAdminStatusFilter = setAdminStatusFilter;
window.refreshAdminDashboard = refreshAdminDashboard;
window.resolveSupportTicket = resolveSupportTicket;
window.toggleFeaturedReview = toggleFeaturedReview;
window.submitAdminReviewReply = submitAdminReviewReply;
window.openOrderPhotosModal = openOrderPhotosModal;
window.closeOrderPhotosModal = closeOrderPhotosModal;

// Start app immediately or on DOMContentLoaded
async function startApp() {
  await initAppData();
  render();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startApp);
} else {
  startApp();
}
