const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE_URL = "http://localhost:8080";
const OUTPUT_DIR = path.join(__dirname, "../app_screenshots");

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function clearToasts(page) {
  await page.evaluate(() => {
    const tc = document.getElementById("toast-container");
    if (tc) tc.innerHTML = "";
  });
}

async function run() {
  console.log("Launching Chrome...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1440,900"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    // 1. Onboarding / Welcome Splash
    console.log("1. Capturing Onboarding Welcome...");
    await page.goto(`${BASE_URL}/#/`, { waitUntil: "networkidle0" });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "01_onboarding_welcome.png") });

    // 2. Log in as Customer Alex Johnson
    console.log("2. Logging in as Alex (Customer)...");
    await page.goto(`${BASE_URL}/#/home`, { waitUntil: "networkidle0" });
    await sleep(300);
    await page.evaluate(async () => {
      await quickLogin("alex@email.com", "password123");
    });
    await sleep(600);
    console.log("Capturing Home Dashboard...");
    await page.evaluate(() => {
      navigate("/home");
      window.scrollTo(0, 0);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "02_home_dashboard.png") });

    // 3. Before/After Transformation on Home
    console.log("3. Capturing Before & After Transformation...");
    await page.evaluate(() => {
      window.scrollTo(0, 520);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "03_before_after_showcase.png") });

    // 4. Verified Reviews on Home
    console.log("4. Capturing Customer Reviews Section...");
    await page.evaluate(() => {
      window.scrollTo(0, 1100);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "04_customer_reviews.png") });

    // 5. Services & Pricing Catalog
    console.log("5. Capturing Services Catalog...");
    await page.evaluate(() => {
      navigate("/services");
      window.scrollTo(0, 0);
    });
    await sleep(600);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "05_services_catalog.png") });

    // 6. Auth Modal (Sign In / Demo Login)
    console.log("6. Capturing Auth Modal...");
    await page.evaluate(() => {
      openAuthModal("login");
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "06_auth_login_modal.png") });
    await page.evaluate(() => {
      closeAuthModal();
    });
    await sleep(300);

    // 7. Booking Step 1: Service Selection
    console.log("7. Capturing Booking Step 1 (Services & Add-ons)...");
    await page.evaluate(() => {
      navigate("/booking");
      state.booking.currentStep = 0;
      state.booking.selectedServiceIds = ["deep-clean"];
      state.booking.selectedAddonIds = ["express", "coating"];
      render();
      window.scrollTo(0, 0);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "07_booking_step1_service.png") });

    // 8. Booking Step 2: Schedule
    console.log("8. Capturing Booking Step 2 (Schedule & Arrival Window)...");
    await page.evaluate(() => {
      state.booking.currentStep = 1;
      state.booking.selectedDateIndex = 1;
      state.booking.selectedTimeSlot = "10:00 AM";
      render();
      window.scrollTo(0, 0);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "08_booking_step2_schedule.png") });

    // 9. Booking Step 3: Address & Instructions
    console.log("9. Capturing Booking Step 3 (Pickup Address)...");
    await page.evaluate(() => {
      state.booking.currentStep = 2;
      state.booking.address = {
        street: "123 Main Street, Apt 4B",
        city: "New York",
        zip: "10001"
      };
      state.booking.instructions = "Ring buzzer #4B, doorman can accept dropoff if unavailable";
      render();
      window.scrollTo(0, 0);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "09_booking_step3_address.png") });

    // 10. Booking Step 4: Payment Summary & Promo Code
    console.log("10. Capturing Booking Step 4 (Payment Summary & Promo Code)...");
    await page.evaluate(() => {
      state.booking.currentStep = 3;
      state.booking.promoCode = "CLEAN20";
      state.booking.promoApplied = true;
      state.booking.promoDiscount = 14.00;
      render();
      window.scrollTo(0, 0);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "10_booking_step4_payment.png") });

    // 11. Customer Active Order Tracking
    console.log("11. Capturing Customer Active Orders Tracking...");
    await page.evaluate(() => {
      navigate("/orders");
      setOrdersTab("active");
      window.scrollTo(0, 0);
    });
    await sleep(600);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "11_customer_active_orders.png") });

    // 12. Customer Past Orders
    console.log("12. Capturing Customer Past Orders...");
    await page.evaluate(() => {
      setOrdersTab("past");
      window.scrollTo(0, 0);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "12_customer_past_orders.png") });

    // 13. Customer Profile & Membership
    console.log("13. Capturing Customer Profile & Membership...");
    await page.evaluate(() => {
      navigate("/profile");
      window.scrollTo(0, 0);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "13_customer_profile_membership.png") });

    // 14. Log in as Spa Admin
    console.log("14. Logging in as Admin (Spa Admin)...");
    await page.evaluate(async () => {
      await quickLogin("admin@sneakerspa.com", "admin123");
    });
    await sleep(600);

    // 14. Admin Live Orders Management
    console.log("Capturing Admin Live Orders Management...");
    await page.evaluate(async () => {
      navigate("/admin");
      setAdminTab("orders");
      window.scrollTo(0, 0);
    });
    await sleep(600);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "14_admin_orders_management.png") });

    // 15. Admin Customer Reviews
    console.log("15. Capturing Admin Customer Reviews...");
    await page.evaluate(() => {
      setAdminTab("reviews");
      window.scrollTo(0, 0);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "15_admin_customer_reviews.png") });

    // 16. Admin Support Desk
    console.log("16. Capturing Admin Support Desk...");
    await page.evaluate(() => {
      setAdminTab("support");
      window.scrollTo(0, 0);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "16_admin_support_desk.png") });

    // 17-20. Mobile Responsive Viewports (iPhone 14/15 size: 390x844)
    console.log("Configuring Mobile Viewport (390x844)...");
    await page.setViewport({
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });

    // Switch back to customer for mobile demo
    await page.evaluate(async () => {
      await quickLogin("alex@email.com", "password123");
    });
    await sleep(500);

    // 17. Mobile Home
    console.log("17. Capturing Mobile Home...");
    await page.evaluate(() => {
      navigate("/home");
      window.scrollTo(0, 0);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "17_mobile_home.png") });

    // 18. Mobile Services
    console.log("18. Capturing Mobile Services...");
    await page.evaluate(() => {
      navigate("/services");
      window.scrollTo(0, 0);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "18_mobile_services.png") });

    // 19. Mobile Booking
    console.log("19. Capturing Mobile Booking Flow...");
    await page.evaluate(() => {
      navigate("/booking");
      state.booking.currentStep = 0;
      render();
      window.scrollTo(0, 0);
    });
    await sleep(500);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "19_mobile_booking.png") });

    // 20. Mobile Admin
    console.log("20. Capturing Mobile Admin Orders...");
    await page.evaluate(async () => {
      await quickLogin("admin@sneakerspa.com", "admin123");
      navigate("/admin");
      setAdminTab("orders");
      window.scrollTo(0, 0);
    });
    await sleep(600);
    await clearToasts(page);
    await page.screenshot({ path: path.join(OUTPUT_DIR, "20_mobile_admin_orders.png") });

    console.log("All 20 pristine screenshots generated successfully!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Error generating screenshots:", err);
  process.exit(1);
});
