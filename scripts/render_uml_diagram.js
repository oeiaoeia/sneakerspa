const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUTPUT_FILE = path.join(__dirname, "../app_screenshots/uml_class_diagram.png");
const OUTPUT_FILE_NUMBERED = path.join(__dirname, "../app_screenshots/21_uml_class_diagram.png");

async function run() {
  console.log("Launching Chrome to render clean white-background UML diagram...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=2600,1900"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2600, height: 1900, deviceScaleFactor: 2 });

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #ffffff;
      color: #0f172a;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 40px;
      min-width: 2500px;
    }
    .wrapper {
      max-width: 2500px;
      margin: 0 auto;
    }

    /* Clean Simple Header */
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .title-area h1 {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .title-area p {
      font-size: 14px;
      color: #64748b;
      margin-top: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    .legend-box {
      display: flex;
      gap: 20px;
      font-size: 12px;
      font-family: 'JetBrains Mono', monospace;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 8px 16px;
      border-radius: 6px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* 3-Column Grid Layout */
    .grid {
      display: grid;
      grid-template-columns: 1.15fr 1fr 1fr;
      gap: 28px;
    }

    /* Package / Module Box */
    .package-box {
      border: 1.5px solid #94a3b8;
      border-radius: 8px;
      background: #ffffff;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .package-tab {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }

    /* Standard Plain UML Class Box */
    .uml-box {
      border: 1.5px solid #0f172a;
      border-radius: 4px;
      background: #ffffff;
      box-shadow: 2px 2px 0px rgba(15, 23, 42, 0.1);
      overflow: hidden;
    }
    .uml-header {
      background: #f1f5f9;
      border-bottom: 1.5px solid #0f172a;
      padding: 8px 12px;
      text-align: center;
    }
    .stereotype {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      color: #475569;
      font-style: italic;
    }
    .class-title {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 1px;
    }

    .uml-section {
      padding: 8px 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      line-height: 1.55;
    }
    .uml-section:not(:last-child) {
      border-bottom: 1px solid #cbd5e1;
    }

    .line {
      display: flex;
      align-items: baseline;
      gap: 4px;
      color: #1e293b;
    }
    .vis {
      font-weight: 700;
      width: 12px;
      color: #0f172a;
    }
    .name {
      font-weight: 600;
      color: #0f172a;
    }
    .type {
      color: #475569;
    }
    .ret {
      color: #0284c7;
      font-weight: 600;
    }

    /* Connectors & Relationships */
    .relation-tag {
      background: #f8fafc;
      border: 1px dashed #64748b;
      border-radius: 4px;
      padding: 6px 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #334155;
      text-align: center;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .relation-arrow {
      font-weight: 700;
      color: #0f172a;
    }

    .inheritance-notice {
      background: #f8fafc;
      border: 1px dashed #0f172a;
      border-radius: 4px;
      padding: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      text-align: center;
      color: #0f172a;
      font-weight: 600;
    }

    .subclasses-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* Footer specs */
    .footer {
      border-top: 1.5px solid #cbd5e1;
      margin-top: 30px;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #64748b;
    }
    .tags {
      display: flex;
      gap: 12px;
    }
    .tag {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      padding: 2px 8px;
      border-radius: 4px;
      color: #334155;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <div class="title-area">
        <h1>Sneaker Spa &mdash; UML Class &amp; Architecture Diagram</h1>
        <p>Spring Boot 3.3.4 &bull; Java 21 LTS &bull; JPA / Hibernate &bull; Neon PostgreSQL</p>
      </div>
      <div class="legend-box">
        <div class="legend-item"><span>&Delta;</span> <span>Inheritance (extends)</span></div>
        <div class="legend-item"><span>&#9655;</span> <span>Realization (implements)</span></div>
        <div class="legend-item"><span>&diams;</span> <span>Composition (1 to *)</span></div>
        <div class="legend-item"><span>+ Public &bull; - Private &bull; # Protected</span></div>
      </div>
    </div>

    <!-- Main 3-Column Diagram Grid -->
    <div class="grid">

      <!-- COLUMN 1: Domain Entities & JPA Mapping -->
      <div class="package-box">
        <div class="package-tab">Package: com.sneakerspa.entity (JPA Domain Model)</div>

        <!-- UserEntity -->
        <div class="uml-box">
          <div class="uml-header">
            <div class="stereotype">&laquo;Entity, @Table("users")&raquo;</div>
            <div class="class-title">UserEntity</div>
          </div>
          <div class="uml-section">
            <div class="line"><span class="vis">-</span><span class="name">id:</span> <span class="type">Long [PK, Generated]</span></div>
            <div class="line"><span class="vis">-</span><span class="name">name:</span> <span class="type">String</span></div>
            <div class="line"><span class="vis">-</span><span class="name">email:</span> <span class="type">String [Unique, Indexed]</span></div>
            <div class="line"><span class="vis">-</span><span class="name">password:</span> <span class="type">String [BCrypt Hash]</span></div>
            <div class="line"><span class="vis">-</span><span class="name">role:</span> <span class="type">Role {CUSTOMER, ADMIN}</span></div>
            <div class="line"><span class="vis">-</span><span class="name">loyaltyPoints:</span> <span class="type">Integer = 1250</span></div>
            <div class="line"><span class="vis">-</span><span class="name">hasActiveSubscription:</span> <span class="type">Boolean</span></div>
            <div class="line"><span class="vis">-</span><span class="name">cleaningsLeft:</span> <span class="type">Integer</span></div>
          </div>
          <div class="uml-section">
            <div class="line"><span class="vis">+</span><span>addLoyaltyPoints(pts: int):</span> <span class="ret">void</span></div>
            <div class="line"><span class="vis">+</span><span>canRedeemClean():</span> <span class="ret">boolean</span></div>
          </div>
        </div>

        <!-- Association User -> Order -->
        <div class="relation-tag">
          <span>UserEntity [1]</span>
          <span class="relation-arrow">&mdash;&mdash;&mdash;&diams; places &mdash;&mdash;&mdash;&gt;</span>
          <span>OrderEntity [0..*]</span>
        </div>

        <!-- OrderEntity -->
        <div class="uml-box">
          <div class="uml-header">
            <div class="stereotype">&laquo;Entity, Implements: Payable, Trackable&raquo;</div>
            <div class="class-title">OrderEntity</div>
          </div>
          <div class="uml-section">
            <div class="line"><span class="vis">-</span><span class="name">id:</span> <span class="type">Long [PK]</span></div>
            <div class="line"><span class="vis">-</span><span class="name">orderNumber:</span> <span class="type">String [e.g. SNK-2847]</span></div>
            <div class="line"><span class="vis">-</span><span class="name">status:</span> <span class="type">OrderStatus [Enum]</span></div>
            <div class="line"><span class="vis">-</span><span class="name">totalAmount:</span> <span class="type">BigDecimal</span></div>
            <div class="line"><span class="vis">-</span><span class="name">pickupDate:</span> <span class="type">LocalDate</span></div>
            <div class="line"><span class="vis">-</span><span class="name">timeSlot:</span> <span class="type">String [e.g. 10:00 AM]</span></div>
            <div class="line"><span class="vis">-</span><span class="name">specialInstructions:</span> <span class="type">String</span></div>
            <div class="line"><span class="vis">-</span><span class="name">promoDiscount:</span> <span class="type">BigDecimal</span></div>
          </div>
          <div class="uml-section">
            <div class="line"><span class="vis">+</span><span>calculateTotal():</span> <span class="ret">Money</span></div>
            <div class="line"><span class="vis">+</span><span>advanceStatus(newStatus: OrderStatus, note: String):</span> <span class="ret">void</span></div>
            <div class="line"><span class="vis">+</span><span>getTrackingHistory():</span> <span class="ret">List&lt;OrderStatusHistory&gt;</span></div>
          </div>
        </div>

        <!-- Supporting Entities: Address & Review -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="uml-box">
            <div class="uml-header">
              <div class="stereotype">&laquo;Entity&raquo;</div>
              <div class="class-title">AddressEntity</div>
            </div>
            <div class="uml-section">
              <div class="line"><span class="vis">-</span><span>id: Long [PK]</span></div>
              <div class="line"><span class="vis">-</span><span>title: String</span></div>
              <div class="line"><span class="vis">-</span><span>street: String</span></div>
              <div class="line"><span class="vis">-</span><span>city: String</span></div>
              <div class="line"><span class="vis">-</span><span>zipCode: String</span></div>
              <div class="line"><span class="vis">-</span><span>isDefault: bool</span></div>
            </div>
          </div>
          <div class="uml-box">
            <div class="uml-header">
              <div class="stereotype">&laquo;Entity&raquo;</div>
              <div class="class-title">ReviewEntity</div>
            </div>
            <div class="uml-section">
              <div class="line"><span class="vis">-</span><span>id: Long [PK]</span></div>
              <div class="line"><span class="vis">-</span><span>author: String</span></div>
              <div class="line"><span class="vis">-</span><span>rating: int [1..5]</span></div>
              <div class="line"><span class="vis">-</span><span>comment: String</span></div>
              <div class="line"><span class="vis">-</span><span>helpfulVotes: int</span></div>
              <div class="line"><span class="vis">-</span><span>isFeatured: bool</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- COLUMN 2: Polymorphism & GoF Strategy Pattern -->
      <div class="package-box">
        <div class="package-tab">Package: com.sneakerspa.model.service &amp; strategy</div>

        <!-- Abstract Root: CleaningService -->
        <div class="uml-box">
          <div class="uml-header">
            <div class="stereotype">&laquo;Abstract Entity, SINGLE_TABLE Inheritance&raquo;</div>
            <div class="class-title">CleaningService</div>
          </div>
          <div class="uml-section">
            <div class="line"><span class="vis">#</span><span class="name">id:</span> <span class="type">String [PK, Discriminator]</span></div>
            <div class="line"><span class="vis">#</span><span class="name">name:</span> <span class="type">String</span></div>
            <div class="line"><span class="vis">#</span><span class="name">price:</span> <span class="type">BigDecimal</span></div>
            <div class="line"><span class="vis">#</span><span class="name">timeEstimate:</span> <span class="type">String</span></div>
            <div class="line"><span class="vis">#</span><span class="name">rating:</span> <span class="type">Double</span></div>
            <div class="line"><span class="vis">#</span><span class="name">inclusions:</span> <span class="type">List&lt;String&gt;</span></div>
          </div>
          <div class="uml-section">
            <div class="line"><span class="vis">+</span><span>calculateCost(pairCount: int):</span> <span class="ret">BigDecimal {abstract}</span></div>
            <div class="line"><span class="vis">+</span><span>getTurnaroundHours():</span> <span class="ret">int {abstract}</span></div>
          </div>
        </div>

        <div class="inheritance-notice">&Delta; Extends CleaningService (Single Table Mapping)</div>

        <!-- Concrete Subclasses -->
        <div class="subclasses-grid">
          <div class="uml-box">
            <div class="uml-header">
              <div class="stereotype">Discriminator: 'BASIC'</div>
              <div class="class-title" style="font-size:13px;">BasicClean</div>
            </div>
            <div class="uml-section">
              <div class="line"><span class="vis">-</span><span>price: $25.00</span></div>
              <div class="line"><span class="vis">-</span><span>time: "1-2 days"</span></div>
              <div class="line"><span class="vis">+</span><span>calcCost(n): $25*n</span></div>
            </div>
          </div>
          <div class="uml-box">
            <div class="uml-header">
              <div class="stereotype">Discriminator: 'DEEP'</div>
              <div class="class-title" style="font-size:13px;">DeepClean</div>
            </div>
            <div class="uml-section">
              <div class="line"><span class="vis">-</span><span>price: $45.00</span></div>
              <div class="line"><span class="vis">-</span><span>time: "2-3 days"</span></div>
              <div class="line"><span class="vis">+</span><span>calcCost(n): $45*n</span></div>
            </div>
          </div>
          <div class="uml-box">
            <div class="uml-header">
              <div class="stereotype">Discriminator: 'RESTORATION'</div>
              <div class="class-title" style="font-size:13px;">PremiumRestoration</div>
            </div>
            <div class="uml-section">
              <div class="line"><span class="vis">-</span><span>price: $75.00</span></div>
              <div class="line"><span class="vis">-</span><span>time: "3-5 days"</span></div>
              <div class="line"><span class="vis">+</span><span>calcCost(n): $75*n</span></div>
            </div>
          </div>
          <div class="uml-box">
            <div class="uml-header">
              <div class="stereotype">Discriminator: 'SUEDE'</div>
              <div class="class-title" style="font-size:13px;">SuedeCare</div>
            </div>
            <div class="uml-section">
              <div class="line"><span class="vis">-</span><span>price: $55.00</span></div>
              <div class="line"><span class="vis">-</span><span>time: "2-4 days"</span></div>
              <div class="line"><span class="vis">+</span><span>calcCost(n): $55*n</span></div>
            </div>
          </div>
        </div>

        <!-- Strategy Pattern -->
        <div class="uml-box" style="margin-top:4px;">
          <div class="uml-header">
            <div class="stereotype">&laquo;Interface, Strategy Pattern&raquo;</div>
            <div class="class-title">PricingStrategy</div>
          </div>
          <div class="uml-section">
            <div class="line"><span class="vis">+</span><span>applyDiscount(base: BigDecimal):</span> <span class="ret">BigDecimal</span></div>
            <div class="line"><span class="vis">+</span><span>getStrategyName():</span> <span class="ret">String</span></div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px;">
          <div class="uml-box" style="text-align:center; padding:8px;">
            <div class="class-title" style="font-size:11px;">StandardPricing</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">0% off (Default)</div>
          </div>
          <div class="uml-box" style="text-align:center; padding:8px;">
            <div class="class-title" style="font-size:11px;">PromoPricing</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">CLEAN20 (20% off)</div>
          </div>
          <div class="uml-box" style="text-align:center; padding:8px;">
            <div class="class-title" style="font-size:11px;">SubscriberPricing</div>
            <div style="font-size:10px; color:#64748b; margin-top:2px;">1 Free / Month</div>
          </div>
        </div>
      </div>

      <!-- COLUMN 3: Observer, Value Objects, Security & Pipeline -->
      <div class="package-box">
        <div class="package-tab">Package: com.sneakerspa.security &amp; observer</div>

        <!-- Observer Pattern -->
        <div class="uml-box">
          <div class="uml-header">
            <div class="stereotype">&laquo;Interface, Observer Pattern&raquo;</div>
            <div class="class-title">StatusObserver</div>
          </div>
          <div class="uml-section">
            <div class="line"><span class="vis">+</span><span>onStatusChange(order: OrderEntity, prev: OrderStatus, next: OrderStatus):</span> <span class="ret">void</span></div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="uml-box">
            <div class="uml-header">
              <div class="stereotype">&laquo;Subject&raquo;</div>
              <div class="class-title" style="font-size:12px;">StatusChangeSubject</div>
            </div>
            <div class="uml-section">
              <div class="line"><span class="vis">-</span><span>observers: List</span></div>
              <div class="line"><span class="vis">+</span><span>attach(obs: StatusObserver)</span></div>
              <div class="line"><span class="vis">+</span><span>notifyAll(order)</span></div>
            </div>
          </div>
          <div class="uml-box">
            <div class="uml-header">
              <div class="stereotype">&laquo;Concrete Observer&raquo;</div>
              <div class="class-title" style="font-size:12px;">CustomerNotifier</div>
            </div>
            <div class="uml-section">
              <div class="line"><span class="vis">+</span><span>sendPushAlert()</span></div>
              <div class="line"><span class="vis">+</span><span>sendEmailETA()</span></div>
            </div>
          </div>
        </div>

        <!-- Value Objects & Builder -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
          <div class="uml-box">
            <div class="uml-header">
              <div class="stereotype">&laquo;Value Object&raquo;</div>
              <div class="class-title" style="font-size:13px;">Money</div>
            </div>
            <div class="uml-section">
              <div class="line"><span class="vis">-</span><span>amount: BigDecimal</span></div>
              <div class="line"><span class="vis">-</span><span>currency: Currency</span></div>
              <div class="line"><span class="vis">+</span><span>add(m: Money): Money</span></div>
            </div>
          </div>
          <div class="uml-box">
            <div class="uml-header">
              <div class="stereotype">&laquo;Creational&raquo;</div>
              <div class="class-title" style="font-size:13px;">OrderBuilder</div>
            </div>
            <div class="uml-section">
              <div class="line"><span class="vis">+</span><span>withUser(u): OrderBuilder</span></div>
              <div class="line"><span class="vis">+</span><span>addService(s): OrderBuilder</span></div>
              <div class="line"><span class="vis">+</span><span>build(): OrderEntity</span></div>
            </div>
          </div>
        </div>

        <!-- Security & JWT Infrastructure -->
        <div class="uml-box">
          <div class="uml-header">
            <div class="stereotype">&laquo;Security Infrastructure, Stateless&raquo;</div>
            <div class="class-title">SecurityConfig &amp; JwtUtil</div>
          </div>
          <div class="uml-section">
            <div class="line"><span class="vis">-</span><span>JWT Algorithm: HMAC-SHA512 (256-bit secret)</span></div>
            <div class="line"><span class="vis">-</span><span>Session Policy: SessionCreationPolicy.STATELESS</span></div>
            <div class="line"><span class="vis">-</span><span>Password Encoder: BCryptPasswordEncoder(10)</span></div>
          </div>
          <div class="uml-section">
            <div class="line"><span class="vis">+</span><span>generateToken(email: String, role: String):</span> <span class="ret">String</span></div>
            <div class="line"><span class="vis">+</span><span>validateToken(token: String):</span> <span class="ret">boolean</span></div>
            <div class="line"><span class="vis">+</span><span>extractClaims(token: String):</span> <span class="ret">Claims</span></div>
          </div>
        </div>

        <!-- OrderStatus Lifecycle State Machine -->
        <div class="uml-box" style="background:#f8fafc;">
          <div class="uml-header" style="background:#e2e8f0;">
            <div class="stereotype">&laquo;Lifecycle Enum State Machine&raquo;</div>
            <div class="class-title" style="font-size:12px;">OrderStatus State Machine</div>
          </div>
          <div class="uml-section" style="display:flex; justify-content:space-between; font-size:11px; font-weight:600; color:#0f172a;">
            <span>RECEIVED</span> &rarr;
            <span>PICKED_UP</span> &rarr;
            <span>CLEANING</span> &rarr;
            <span>QUALITY_CHECK</span> &rarr;
            <span style="color:#16a34a;">DELIVERED</span>
          </div>
        </div>

      </div>

    </div>

    <!-- Clean Footer -->
    <div class="footer">
      <div>
        <strong>SNEAKER SPA &mdash; SYSTEM ARCHITECTURE SPECIFICATION</strong> &bull; GENERATED DIRECTLY FROM CODEBASE
      </div>
      <div class="tags">
        <span class="tag">Spring Boot 3.3.4</span>
        <span class="tag">Java 21 LTS</span>
        <span class="tag">Hibernate 6.5 / JPA 3.1</span>
        <span class="tag">Neon PostgreSQL (PgBouncer)</span>
        <span class="tag">JWT HMAC-SHA512</span>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: OUTPUT_FILE,
    fullPage: true,
  });
  await page.screenshot({
    path: OUTPUT_FILE_NUMBERED,
    fullPage: true,
  });

  console.log("Successfully generated plain & simple white-background UML diagrams:");
  console.log("-", OUTPUT_FILE);
  console.log("-", OUTPUT_FILE_NUMBERED);

  await browser.close();
}

run().catch(err => {
  console.error("Error generating plain UML diagram:", err);
  process.exit(1);
});
