const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_FILE = path.join(__dirname, "../app_screenshots/uml_class_diagram.png");
const OUTPUT_FILE_NUMBERED = path.join(__dirname, "../app_screenshots/21_uml_class_diagram.png");

async function run() {
  console.log("Launching Chrome to render UML diagram...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=2800,2000"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2800, height: 2000, deviceScaleFactor: 2 });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #09090b;
      color: #f4f4f5;
      font-family: 'Space Grotesk', sans-serif;
      padding: 48px;
      min-width: 2700px;
    }
    .main-wrapper {
      max-width: 2650px;
      margin: 0 auto;
    }
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 36px;
      padding-bottom: 24px;
      border-bottom: 1px solid rgba(0, 240, 255, 0.25);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .logo-badge {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #00f0ff 0%, #0077ff 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.5);
    }
    .logo-badge svg {
      width: 32px;
      height: 32px;
      fill: #000;
    }
    h1 {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
      background: linear-gradient(180deg, #ffffff 0%, #a1a1aa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 15px;
      color: #a1a1aa;
      margin-top: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .legend-bar {
      display: flex;
      gap: 24px;
      background: rgba(24, 24, 27, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 12px 24px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      font-family: 'JetBrains Mono', monospace;
    }
    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 4px;
    }

    /* Grid Layout */
    .grid-container {
      display: grid;
      grid-template-columns: 1.15fr 1fr 1fr;
      gap: 32px;
    }

    /* Module Section */
    .module-card {
      background: rgba(18, 18, 23, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .module-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 16px;
    }
    .module-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 18px;
      font-weight: 700;
    }
    .module-tag {
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      padding: 4px 10px;
      border-radius: 6px;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    /* UML Class Card */
    .uml-class {
      background: #121217;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      transition: all 0.2s ease;
    }
    .uml-class.cyan-glow {
      border-color: rgba(0, 240, 255, 0.4);
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.15);
    }
    .uml-class.purple-glow {
      border-color: rgba(168, 85, 247, 0.4);
      box-shadow: 0 0 20px rgba(168, 85, 247, 0.15);
    }
    .uml-class.emerald-glow {
      border-color: rgba(16, 185, 129, 0.4);
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.15);
    }
    .uml-class.amber-glow {
      border-color: rgba(245, 158, 11, 0.4);
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
    }

    .class-header {
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      text-align: center;
    }
    .stereotype {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #a1a1aa;
      font-style: italic;
      margin-bottom: 2px;
    }
    .class-name {
      font-size: 16px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }
    .class-name.cyan { color: #00f0ff; }
    .class-name.purple { color: #c084fc; }
    .class-name.emerald { color: #34d399; }
    .class-name.amber { color: #fbbf24; }
    .class-name.white { color: #ffffff; }

    .class-section {
      padding: 10px 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      line-height: 1.6;
    }
    .class-section:not(:last-child) {
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .prop-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      color: #e4e4e7;
    }
    .vis {
      font-weight: 700;
      width: 12px;
      display: inline-block;
    }
    .vis-pub { color: #34d399; }
    .vis-priv { color: #f87171; }
    .vis-prot { color: #fbbf24; }
    .prop-name { color: #f4f4f5; font-weight: 500; }
    .prop-type { color: #94a3b8; }
    .method-row {
      color: #e2e8f0;
      display: flex;
      gap: 6px;
    }
    .ret-type { color: #38bdf8; font-weight: 500; }

    /* Hierarchy Connectors Box */
    .subclass-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 12px;
      position: relative;
    }
    .inheritance-label {
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #00f0ff;
      background: rgba(0, 240, 255, 0.08);
      border: 1px dashed rgba(0, 240, 255, 0.4);
      padding: 6px 12px;
      border-radius: 8px;
      margin: 8px 0;
    }

    /* Relationship Badge */
    .relation-banner {
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
      padding: 10px 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #a1a1aa;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .relation-arrow {
      color: #00f0ff;
      font-weight: 700;
    }

    /* Footer Meta */
    .footer-bar {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #71717a;
    }
    .footer-tags {
      display: flex;
      gap: 16px;
    }
    .footer-tag {
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 10px;
      border-radius: 6px;
      color: #d4d4d8;
    }
  </style>
</head>
<body>
  <div class="main-wrapper">
    <!-- Top Header -->
    <div class="header">
      <div class="header-left">
        <div class="logo-badge">
          <svg viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
        </div>
        <div>
          <h1>Sneaker Spa — Unified UML Domain & System Architecture</h1>
          <p class="subtitle">Spring Boot 3.3.4 (Java 21) &bull; Single-Table Polymorphism &bull; GoF Strategy &bull; Observer &bull; Neon Serverless Postgres</p>
        </div>
      </div>
      <div class="legend-bar">
        <div class="legend-item"><div class="legend-dot" style="background:#00f0ff;"></div> <span>Polymorphic Services</span></div>
        <div class="legend-item"><div class="legend-dot" style="background:#c084fc;"></div> <span>Strategy Pattern</span></div>
        <div class="legend-item"><div class="legend-dot" style="background:#34d399;"></div> <span>JPA Relational Entities</span></div>
        <div class="legend-item"><div class="legend-dot" style="background:#fbbf24;"></div> <span>Observer & State</span></div>
      </div>
    </div>

    <!-- Main Architecture Grid -->
    <div class="grid-container">

      <!-- COLUMN 1: Core Domain Entities & Relational Mappings -->
      <div class="module-card">
        <div class="module-header">
          <div class="module-title">
            <span style="color:#34d399;">&bull;</span>
            <span>JPA Relational Domain</span>
          </div>
          <span class="module-tag" style="background:rgba(16,185,129,0.15); color:#34d399;">Database Entities</span>
        </div>

        <!-- UserEntity -->
        <div class="uml-class emerald-glow">
          <div class="class-header">
            <div class="stereotype">&lt;&lt;Entity, Table: users&gt;&gt;</div>
            <div class="class-name emerald">UserEntity</div>
          </div>
          <div class="class-section">
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">id:</span> <span class="prop-type">Long [PK, Generated]</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">name:</span> <span class="prop-type">String</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">email:</span> <span class="prop-type">String [Unique, Indexed]</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">password:</span> <span class="prop-type">String [BCrypt Hash]</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">role:</span> <span class="prop-type">Role {CUSTOMER, ADMIN}</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">loyaltyPoints:</span> <span class="prop-type">Integer = 1250</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">hasActiveSubscription:</span> <span class="prop-type">Boolean</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">cleaningsLeft:</span> <span class="prop-type">Integer</span></div>
          </div>
          <div class="class-section">
            <div class="method-row"><span class="vis vis-pub">+</span><span>addLoyaltyPoints(pts: int):</span> <span class="ret-type">void</span></div>
            <div class="method-row"><span class="vis vis-pub">+</span><span>canRedeemClean():</span> <span class="ret-type">boolean</span></div>
          </div>
        </div>

        <!-- Relationship User -> Order -->
        <div class="relation-banner">
          <span>UserEntity [1]</span>
          <span class="relation-arrow">&mdash;&mdash;&lt;| places &gt;&mdash;&mdash;&gt;</span>
          <span>OrderEntity [0..*]</span>
        </div>

        <!-- OrderEntity -->
        <div class="uml-class emerald-glow">
          <div class="class-header">
            <div class="stereotype">&lt;&lt;Entity, Implements: Payable, Trackable&gt;&gt;</div>
            <div class="class-name emerald">OrderEntity</div>
          </div>
          <div class="class-section">
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">id:</span> <span class="prop-type">Long [PK]</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">orderNumber:</span> <span class="prop-type">String [e.g. SNK-2847]</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">status:</span> <span class="prop-type">OrderStatus [Enum]</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">totalAmount:</span> <span class="prop-type">BigDecimal</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">pickupDate:</span> <span class="prop-type">LocalDate</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">timeSlot:</span> <span class="prop-type">String [e.g. 10:00 AM]</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">specialInstructions:</span> <span class="prop-type">String</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span class="prop-name">promoDiscount:</span> <span class="prop-type">BigDecimal</span></div>
          </div>
          <div class="class-section">
            <div class="method-row"><span class="vis vis-pub">+</span><span>calculateTotal():</span> <span class="ret-type">Money</span></div>
            <div class="method-row"><span class="vis vis-pub">+</span><span>advanceStatus(newStatus, note):</span> <span class="ret-type">void</span></div>
            <div class="method-row"><span class="vis vis-pub">+</span><span>getTrackingHistory():</span> <span class="ret-type">List&lt;History&gt;</span></div>
          </div>
        </div>

        <!-- Supporting Entities: Address & Review -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
          <div class="uml-class">
            <div class="class-header">
              <div class="stereotype">&lt;&lt;Entity&gt;&gt;</div>
              <div class="class-name white">AddressEntity</div>
            </div>
            <div class="class-section">
              <div class="prop-row"><span class="vis vis-priv">-</span><span>id: Long</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>title: String</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>street: String</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>city: String</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>zip: String</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>isDefault: bool</span></div>
            </div>
          </div>
          <div class="uml-class">
            <div class="class-header">
              <div class="stereotype">&lt;&lt;Entity&gt;&gt;</div>
              <div class="class-name white">ReviewEntity</div>
            </div>
            <div class="class-section">
              <div class="prop-row"><span class="vis vis-priv">-</span><span>id: Long</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>author: String</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>rating: int</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>comment: String</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>helpfulVotes: int</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>isFeatured: bool</span></div>
            </div>
          </div>
        </div>

      </div>

      <!-- COLUMN 2: Polymorphic Service Hierarchy & Strategy Pattern -->
      <div class="module-card">
        <div class="module-header">
          <div class="module-title">
            <span style="color:#00f0ff;">&bull;</span>
            <span>Polymorphism & Strategy</span>
          </div>
          <span class="module-tag" style="background:rgba(0,240,255,0.15); color:#00f0ff;">GoF Behavioral & Creational</span>
        </div>

        <!-- Abstract Root: CleaningService -->
        <div class="uml-class cyan-glow">
          <div class="class-header">
            <div class="stereotype">&lt;&lt;Abstract Entity, SINGLE_TABLE Inheritance&gt;&gt;</div>
            <div class="class-name cyan">CleaningService</div>
          </div>
          <div class="class-section">
            <div class="prop-row"><span class="vis vis-prot">#</span><span class="prop-name">id:</span> <span class="prop-type">String [PK, Discriminator]</span></div>
            <div class="prop-row"><span class="vis vis-prot">#</span><span class="prop-name">name:</span> <span class="prop-type">String</span></div>
            <div class="prop-row"><span class="vis vis-prot">#</span><span class="prop-name">price:</span> <span class="prop-type">BigDecimal</span></div>
            <div class="prop-row"><span class="vis vis-prot">#</span><span class="prop-name">timeEstimate:</span> <span class="prop-type">String</span></div>
            <div class="prop-row"><span class="vis vis-prot">#</span><span class="prop-name">rating:</span> <span class="prop-type">Double</span></div>
            <div class="prop-row"><span class="vis vis-prot">#</span><span class="prop-name">inclusions:</span> <span class="prop-type">List&lt;String&gt;</span></div>
          </div>
          <div class="class-section">
            <div class="method-row"><span class="vis vis-pub">+</span><span>calculateCost(pairCount: int):</span> <span class="ret-type">BigDecimal {abstract}</span></div>
            <div class="method-row"><span class="vis vis-pub">+</span><span>getTurnaroundHours():</span> <span class="ret-type">int {abstract}</span></div>
          </div>
        </div>

        <div class="inheritance-label">&Delta; Inherits via @DiscriminatorValue (Single Table)</div>

        <!-- 4 Concrete Subclasses -->
        <div class="subclass-grid">
          <div class="uml-class">
            <div class="class-header">
              <div class="stereotype">Discriminator: 'BASIC'</div>
              <div class="class-name cyan" style="font-size:14px;">BasicClean</div>
            </div>
            <div class="class-section">
              <div class="prop-row"><span class="vis vis-priv">-</span><span>price: $25.00</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>time: "1-2 days"</span></div>
              <div class="method-row"><span class="vis vis-pub">+</span><span>calcCost(n): $25*n</span></div>
            </div>
          </div>
          <div class="uml-class">
            <div class="class-header">
              <div class="stereotype">Discriminator: 'DEEP'</div>
              <div class="class-name cyan" style="font-size:14px;">DeepClean</div>
            </div>
            <div class="class-section">
              <div class="prop-row"><span class="vis vis-priv">-</span><span>price: $45.00</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>time: "2-3 days"</span></div>
              <div class="method-row"><span class="vis vis-pub">+</span><span>calcCost(n): $45*n</span></div>
            </div>
          </div>
          <div class="uml-class">
            <div class="class-header">
              <div class="stereotype">Discriminator: 'RESTORATION'</div>
              <div class="class-name cyan" style="font-size:14px;">PremiumRestoration</div>
            </div>
            <div class="class-section">
              <div class="prop-row"><span class="vis vis-priv">-</span><span>price: $75.00</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>time: "3-5 days"</span></div>
              <div class="method-row"><span class="vis vis-pub">+</span><span>calcCost(n): $75*n</span></div>
            </div>
          </div>
          <div class="uml-class">
            <div class="class-header">
              <div class="stereotype">Discriminator: 'SUEDE'</div>
              <div class="class-name cyan" style="font-size:14px;">SuedeCare</div>
            </div>
            <div class="class-section">
              <div class="prop-row"><span class="vis vis-priv">-</span><span>price: $55.00</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>time: "2-4 days"</span></div>
              <div class="method-row"><span class="vis vis-pub">+</span><span>calcCost(n): $55*n</span></div>
            </div>
          </div>
        </div>

        <!-- Strategy Pattern: Pricing -->
        <div class="uml-class purple-glow" style="margin-top:10px;">
          <div class="class-header">
            <div class="stereotype">&lt;&lt;Interface, Strategy Pattern&gt;&gt;</div>
            <div class="class-name purple">PricingStrategy</div>
          </div>
          <div class="class-section">
            <div class="method-row"><span class="vis vis-pub">+</span><span>applyDiscount(baseAmount: BigDecimal):</span> <span class="ret-type">BigDecimal</span></div>
            <div class="method-row"><span class="vis vis-pub">+</span><span>getStrategyName():</span> <span class="ret-type">String</span></div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
          <div class="uml-class" style="padding:10px; text-align:center;">
            <div class="class-name purple" style="font-size:12px;">StandardPricing</div>
            <div style="font-size:10px; color:#94a3b8; margin-top:4px;">0% off (Default)</div>
          </div>
          <div class="uml-class" style="padding:10px; text-align:center;">
            <div class="class-name purple" style="font-size:12px;">PromoPricing</div>
            <div style="font-size:10px; color:#94a3b8; margin-top:4px;">CLEAN20 (20% off)</div>
          </div>
          <div class="uml-class" style="padding:10px; text-align:center;">
            <div class="class-name purple" style="font-size:12px;">SubscriberPricing</div>
            <div style="font-size:10px; color:#94a3b8; margin-top:4px;">1 Free / Month</div>
          </div>
        </div>

      </div>

      <!-- COLUMN 3: Observer, Value Objects, Security & Services -->
      <div class="module-card">
        <div class="module-header">
          <div class="module-title">
            <span style="color:#fbbf24;">&bull;</span>
            <span>Observer, Security & Architecture</span>
          </div>
          <span class="module-tag" style="background:rgba(245,158,11,0.15); color:#fbbf24;">Observer & Security</span>
        </div>

        <!-- Observer Pattern: Status Updates -->
        <div class="uml-class amber-glow">
          <div class="class-header">
            <div class="stereotype">&lt;&lt;Interface, Observer Pattern&gt;&gt;</div>
            <div class="class-name amber">StatusObserver</div>
          </div>
          <div class="class-section">
            <div class="method-row"><span class="vis vis-pub">+</span><span>onStatusChange(order: OrderEntity, prev, next):</span> <span class="ret-type">void</span></div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
          <div class="uml-class">
            <div class="class-header">
              <div class="stereotype">&lt;&lt;Subject&gt;&gt;</div>
              <div class="class-name amber" style="font-size:13px;">StatusChangeSubject</div>
            </div>
            <div class="class-section">
              <div class="prop-row"><span class="vis vis-priv">-</span><span>observers: List</span></div>
              <div class="method-row"><span class="vis vis-pub">+</span><span>attach(obs)</span></div>
              <div class="method-row"><span class="vis vis-pub">+</span><span>notifyAll()</span></div>
            </div>
          </div>
          <div class="uml-class">
            <div class="class-header">
              <div class="stereotype">&lt;&lt;Concrete Observer&gt;&gt;</div>
              <div class="class-name amber" style="font-size:13px;">CustomerNotifier</div>
            </div>
            <div class="class-section">
              <div class="method-row"><span class="vis vis-pub">+</span><span>sendPushAlert()</span></div>
              <div class="method-row"><span class="vis vis-pub">+</span><span>sendEmailETA()</span></div>
            </div>
          </div>
        </div>

        <!-- Core Interfaces & Value Objects -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
          <div class="uml-class">
            <div class="class-header">
              <div class="stereotype">&lt;&lt;Value Object&gt;&gt;</div>
              <div class="class-name white" style="font-size:14px;">Money</div>
            </div>
            <div class="class-section">
              <div class="prop-row"><span class="vis vis-priv">-</span><span>amount: BigDecimal</span></div>
              <div class="prop-row"><span class="vis vis-priv">-</span><span>currency: Currency</span></div>
              <div class="method-row"><span class="vis vis-pub">+</span><span>add(Money): Money</span></div>
            </div>
          </div>
          <div class="uml-class">
            <div class="class-header">
              <div class="stereotype">&lt;&lt;Creational&gt;&gt;</div>
              <div class="class-name white" style="font-size:14px;">OrderBuilder</div>
            </div>
            <div class="class-section">
              <div class="method-row"><span class="vis vis-pub">+</span><span>withUser(u): Builder</span></div>
              <div class="method-row"><span class="vis vis-pub">+</span><span>addService(s): Builder</span></div>
              <div class="method-row"><span class="vis vis-pub">+</span><span>build(): OrderEntity</span></div>
            </div>
          </div>
        </div>

        <!-- Security & JWT Infrastructure -->
        <div class="uml-class cyan-glow">
          <div class="class-header">
            <div class="stereotype">&lt;&lt;Security Infrastructure, Stateless&gt;&gt;</div>
            <div class="class-name cyan">SecurityConfig &amp; JwtUtil</div>
          </div>
          <div class="class-section">
            <div class="prop-row"><span class="vis vis-priv">-</span><span>JWT Algorithm: HMAC-SHA512 (256-bit secret)</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span>Session: SessionCreationPolicy.STATELESS</span></div>
            <div class="prop-row"><span class="vis vis-priv">-</span><span>Password Encoder: BCryptPasswordEncoder(10)</span></div>
          </div>
          <div class="class-section">
            <div class="method-row"><span class="vis vis-pub">+</span><span>generateToken(email, role):</span> <span class="ret-type">String</span></div>
            <div class="method-row"><span class="vis vis-pub">+</span><span>validateToken(token):</span> <span class="ret-type">boolean</span></div>
            <div class="method-row"><span class="vis vis-pub">+</span><span>extractClaims(token):</span> <span class="ret-type">Claims</span></div>
          </div>
        </div>

        <!-- OrderStatus State Machine -->
        <div class="uml-class" style="background:#15151c;">
          <div class="class-header">
            <div class="stereotype">&lt;&lt;Lifecycle Enum State Machine&gt;&gt;</div>
            <div class="class-name white" style="font-size:14px;">OrderStatus Pipeline</div>
          </div>
          <div class="class-section" style="display:flex; justify-content:space-between; font-size:11px; color:#38bdf8;">
            <span>RECEIVED</span> &rarr;
            <span>PICKED_UP</span> &rarr;
            <span>CLEANING</span> &rarr;
            <span>QUALITY_CHECK</span> &rarr;
            <span style="color:#34d399;">DELIVERED</span>
          </div>
        </div>

      </div>

    </div>

    <!-- Footer System Specifications -->
    <div class="footer-bar">
      <div>
        <strong>SNEAKER SPA ARCHITECTURE SPECIFICATION</strong> &bull; GENERATED AUTOMATICALLY FROM SOURCE CODE
      </div>
      <div class="footer-tags">
        <span class="footer-tag">Spring Boot v3.3.4</span>
        <span class="footer-tag">Java 21 LTS</span>
        <span class="footer-tag">Hibernate / JPA 3.1</span>
        <span class="footer-tag">Neon PostgreSQL (PgBouncer)</span>
        <span class="footer-tag">JWT HMAC-SHA512</span>
        <span class="footer-tag">Tailwind + ES6 SPA</span>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1200));

  // Save to both uml_class_diagram.png and 21_uml_class_diagram.png
  await page.screenshot({
    path: OUTPUT_FILE,
    fullPage: true,
  });
  await page.screenshot({
    path: OUTPUT_FILE_NUMBERED,
    fullPage: true,
  });

  console.log("Successfully generated UML diagram images:");
  console.log("-", OUTPUT_FILE);
  console.log("-", OUTPUT_FILE_NUMBERED);

  await browser.close();
}

run().catch(err => {
  console.error("Error generating UML diagram:", err);
  process.exit(1);
});
