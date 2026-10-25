import subprocess
import time
import json
import socket
import base64
import urllib.request
import os
import sys

CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT = 9250
USER_DATA = f"/tmp/chrome_verify_{PORT}"

def ws_send(s, data_dict):
    payload = json.dumps(data_dict).encode("utf-8")
    frame = bytearray([0x81])
    length = len(payload)
    if length <= 125:
        frame.append(0x80 | length)
    elif length <= 65535:
        frame.append(0x80 | 126)
        frame.extend(length.to_bytes(2, "big"))
    else:
        frame.append(0x80 | 127)
        frame.extend(length.to_bytes(8, "big"))
    mask = os.urandom(4)
    frame.extend(mask)
    masked = bytearray(b ^ mask[i % 4] for i, b in enumerate(payload))
    frame.extend(masked)
    s.sendall(frame)

def ws_recv(s):
    res_bytes = bytearray()
    while True:
        header = s.recv(2)
        if not header:
            break
        b1 = header[0]
        b2 = header[1]
        opcode = b1 & 0x0f
        length = b2 & 0x7f
        if length == 126:
            length = int.from_bytes(s.recv(2), "big")
        elif length == 127:
            length = int.from_bytes(s.recv(8), "big")
        data = bytearray()
        while len(data) < length:
            chunk = s.recv(length - len(data))
            if not chunk:
                break
            data.extend(chunk)
        res_bytes.extend(data)
        if b1 & 0x80:
            break
    return json.loads(res_bytes.decode("utf-8", errors="ignore"))

def send_cdp(s, method, params=None, msg_id=1):
    ws_send(s, {"id": msg_id, "method": method, "params": params or {}})
    while True:
        msg = ws_recv(s)
        if msg.get("id") == msg_id:
            return msg

def eval_js(s, expr, msg_id):
    res = send_cdp(s, "Runtime.evaluate", {
        "expression": expr,
        "awaitPromise": True,
        "returnByValue": True
    }, msg_id)
    return res.get("result", {}).get("result", {}).get("value")

def snap(s, path, msg_id):
    res = send_cdp(s, "Page.captureScreenshot", {"format": "png"}, msg_id)
    data = res["result"]["data"]
    with open(path, "wb") as f:
        f.write(base64.b64decode(data))
    print(f"Captured: {path}")

def set_viewport(s, width, height, msg_id):
    send_cdp(s, "Emulation.setDeviceMetricsOverride", {
        "width": width,
        "height": height,
        "deviceScaleFactor": 1,
        "mobile": width < 768
    }, msg_id)
    eval_js(s, "window.dispatchEvent(new Event('resize'));", msg_id + 500)
    time.sleep(0.5)

def goto_route(s, route, msg_id):
    eval_js(s, f"""
    (async () => {{
        state.currentRoute = '{route}';
        window.location.hash = '{route}';
        await render();
        window.dispatchEvent(new Event('resize'));
    }})()
    """, msg_id)
    time.sleep(0.5)

def run():
    os.makedirs("screenshots", exist_ok=True)
    proc = subprocess.Popen([
        CHROME_PATH,
        "--headless=new",
        f"--remote-debugging-port={PORT}",
        f"--user-data-dir={USER_DATA}",
        "--disable-gpu",
        "--window-size=1280,900",
        "http://localhost:8080/#/"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(2)

    try:
        resp = urllib.request.urlopen(f"http://localhost:{PORT}/json")
        targets = json.loads(resp.read().decode())
        page = next(t for t in targets if t.get("type") == "page")
        ws_url = page["webSocketDebuggerUrl"]

        host_port = ws_url.replace("ws://", "").split("/")[0]
        host, p = host_port.split(":")
        path = ws_url[ws_url.find(host_port) + len(host_port):]

        s = socket.create_connection((host, int(p)), timeout=15)
        key = base64.b64encode(b"0123456789abcdef").decode()
        handshake = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {host}:{p}\r\n"
            f"Upgrade: websocket\r\n"
            f"Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            f"Sec-WebSocket-Version: 13\r\n\r\n"
        )
        s.sendall(handshake.encode())
        s.recv(4096)

        send_cdp(s, "Page.enable", {}, 1)
        time.sleep(1)

        msg_id = 100

        # -------------------------------------------------------------
        # Part 1: Verify Resolutions (375, 768, 1280, 1920)
        # -------------------------------------------------------------
        print("\n=== VERIFYING RESPONSIVENESS AT 375px, 768px, 1280px, 1920px ===")

        # Log in first so sidebar user card and full navigation are rendered
        eval_js(s, "API.login('alex@email.com', 'password123')", msg_id); msg_id += 1
        goto_route(s, "/home", msg_id); msg_id += 1
        time.sleep(1)

        resolutions = [375, 768, 1280, 1920]
        for w in resolutions:
            h = 900
            set_viewport(s, w, h, msg_id); msg_id += 1
            eval_js(s, "render()", msg_id); msg_id += 1
            time.sleep(0.5)

            # Check overflow
            has_overflow = eval_js(s, "document.documentElement.scrollWidth > window.innerWidth", msg_id); msg_id += 1
            scroll_w = eval_js(s, "document.documentElement.scrollWidth", msg_id); msg_id += 1
            inner_w = eval_js(s, "window.innerWidth", msg_id); msg_id += 1
            
            # Check bottom nav display
            bottom_nav_visible = eval_js(s, """
            (() => {
                const nav = document.querySelector('nav.fixed.bottom-0');
                if (!nav) return false;
                const style = window.getComputedStyle(nav);
                return style.display !== 'none' && style.visibility !== 'hidden';
            })()
            """, msg_id); msg_id += 1

            # Check sidebar display
            sidebar_visible = eval_js(s, """
            (() => {
                const aside = document.querySelector('aside.fixed.inset-y-0.left-0');
                if (!aside) return false;
                const style = window.getComputedStyle(aside);
                return style.display !== 'none' && style.visibility !== 'hidden';
            })()
            """, msg_id); msg_id += 1

            # Check content padding / position to ensure no sidebar overlap
            content_left_padding = eval_js(s, """
            (() => {
                const main = document.querySelector('.min-h-screen.md\\\\:pl-\\\\[260px\\\\]') || document.querySelector('main') || document.querySelector('#app > div');
                if (!main) return null;
                const style = window.getComputedStyle(main);
                return style.paddingLeft;
            })()
            """, msg_id); msg_id += 1

            print(f"[{w}px] Overflow: {has_overflow} (scrollWidth: {scroll_w}, innerWidth: {inner_w}) | BottomNav: {bottom_nav_visible} | Sidebar: {sidebar_visible} | Content pl: {content_left_padding}")

            if w < 768:
                assert bottom_nav_visible, f"Expected bottom nav to be visible at {w}px"
                assert not sidebar_visible, f"Expected sidebar to be hidden at {w}px"
            else:
                assert not bottom_nav_visible, f"Expected bottom nav to be hidden at {w}px"
                assert sidebar_visible, f"Expected sidebar to be visible at {w}px"
                assert content_left_padding == "260px", f"Expected content padding-left to be 260px at {w}px, got {content_left_padding}"
            
            assert not has_overflow, f"Horizontal overflow detected at {w}px! scrollWidth={scroll_w} > innerWidth={inner_w}"

        print("Responsiveness checks passed at all 4 resolutions!")

        # -------------------------------------------------------------
        # Part 2: Desktop 1280px Screenshots and Full Flow
        # -------------------------------------------------------------
        print("\n=== EXECUTING FULL FLOW & CAPTURING DESKTOP SCREENSHOTS (1280px) ===")
        set_viewport(s, 1280, 900, msg_id); msg_id += 1

        # 1. Onboarding Screen
        print("1. Desktop Onboarding (Split-screen)")
        goto_route(s, "/", msg_id); msg_id += 1
        time.sleep(1)
        snap(s, "screenshots/desktop_onboarding.png", msg_id); msg_id += 1

        # 2. Home Screen
        print("2. Desktop Home")
        goto_route(s, "/home", msg_id); msg_id += 1
        time.sleep(1)
        snap(s, "screenshots/desktop_home.png", msg_id); msg_id += 1

        # 3. Services Screen
        print("3. Desktop Services (Grid & Comparison)")
        goto_route(s, "/services", msg_id); msg_id += 1
        time.sleep(1)
        snap(s, "screenshots/desktop_services.png", msg_id); msg_id += 1

        # Also test comparison panel on services
        eval_js(s, "state.selectedCompareServices = ['basic-clean', 'deep-clean']; render()", msg_id); msg_id += 1
        time.sleep(0.5)
        snap(s, "screenshots/desktop_services_compare.png", msg_id); msg_id += 1
        eval_js(s, "state.selectedCompareServices = []; render()", msg_id); msg_id += 1

        # 4. Booking Flow Step-by-Step
        print("4. Desktop Booking - Step 0 (Select Services)")
        goto_route(s, "/booking", msg_id); msg_id += 1
        eval_js(s, "state.booking.currentStep = 0; state.booking.selectedServiceIds = ['deep-clean', 'suede-care']; state.booking.selectedAddonIds = ['coating']; recalculateBookingPricing(); render();", msg_id); msg_id += 1
        time.sleep(0.5)
        snap(s, "screenshots/desktop_booking_step0.png", msg_id); msg_id += 1

        print("5. Desktop Booking - Step 1 (Schedule)")
        eval_js(s, "state.booking.currentStep = 1; state.booking.selectedDateIndex = 1; state.booking.selectedTimeSlot = '2:00 PM'; render();", msg_id); msg_id += 1
        time.sleep(0.5)
        snap(s, "screenshots/desktop_booking_step1.png", msg_id); msg_id += 1

        print("6. Desktop Booking - Step 2 (Address)")
        eval_js(s, "state.booking.currentStep = 2; state.booking.address = { street: '742 Evergreen Terrace', city: 'New York', zip: '10021' }; render();", msg_id); msg_id += 1
        time.sleep(0.5)
        snap(s, "screenshots/desktop_booking_step2.png", msg_id); msg_id += 1

        print("7. Desktop Booking - Step 3 (Photos)")
        eval_js(s, """
        state.booking.currentStep = 3;
        state.booking.uploadedPhotos = [
            { slotNumber: 1, slotLabel: 'Front', photoUrl: '/api/orders/SNK-2847/photos/front', originalFilename: 'front.jpg', fileSize: 102400 },
            { slotNumber: 2, slotLabel: 'Back', photoUrl: '/api/orders/SNK-2847/photos/back', originalFilename: 'back.jpg', fileSize: 102400 }
        ];
        render();
        """, msg_id); msg_id += 1
        time.sleep(0.5)
        snap(s, "screenshots/desktop_booking_step3.png", msg_id); msg_id += 1

        print("8. Desktop Booking - Step 4 (Payment Summary & Promo)")
        eval_js(s, "state.booking.currentStep = 4; render();", msg_id); msg_id += 1
        time.sleep(0.5)
        eval_js(s, "document.getElementById('promo-input').value = 'CLEAN20'; applyBookingPromo()", msg_id); msg_id += 1
        time.sleep(1)
        snap(s, "screenshots/desktop_booking_step4.png", msg_id); msg_id += 1

        # Submit Booking
        print("9. Submitting Booking")
        eval_js(s, "handleBookingNext()", msg_id); msg_id += 1
        time.sleep(2)

        # 10. Orders Screen (Active Tab)
        print("10. Desktop Orders (Active Tab - 2 Column Split)")
        goto_route(s, "/orders", msg_id); msg_id += 1
        time.sleep(1.5)
        snap(s, "screenshots/desktop_orders_active.png", msg_id); msg_id += 1

        # 11. Orders Screen (Past Tab)
        print("11. Desktop Orders (Past Tab - 2 Column Grid)")
        eval_js(s, "setOrdersTab('past')", msg_id); msg_id += 1
        time.sleep(0.5)
        snap(s, "screenshots/desktop_orders_past.png", msg_id); msg_id += 1

        # 12. Profile Screen
        print("12. Desktop Profile (2 Columns)")
        goto_route(s, "/profile", msg_id); msg_id += 1
        time.sleep(1)
        snap(s, "screenshots/desktop_profile.png", msg_id); msg_id += 1

        # 13. Admin Console Screen (Log in as Admin)
        print("13. Desktop Admin Console (Full-width Table)")
        eval_js(s, "API.login('admin@sneakerspa.com', 'admin123')", msg_id); msg_id += 1
        time.sleep(1)
        goto_route(s, "/admin", msg_id); msg_id += 1
        time.sleep(1.5)
        snap(s, "screenshots/desktop_admin.png", msg_id); msg_id += 1

        print("\nALL VERIFICATIONS AND SCREENSHOTS COMPLETED SUCCESSFULLY!")
        s.close()
    finally:
        proc.terminate()

if __name__ == "__main__":
    run()
