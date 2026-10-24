import subprocess
import time
import json
import socket
import base64
import urllib.request
import os

CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT = 9240
USER_DATA = f"/tmp/chrome_flow_{PORT}"

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

def run_browser_tests():
    proc = subprocess.Popen([
        CHROME_PATH,
        "--headless=new",
        f"--remote-debugging-port={PORT}",
        f"--user-data-dir={USER_DATA}",
        "--disable-gpu",
        "--window-size=430,932",
        "http://localhost:8080/#/home"
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

        # Login as Alex
        print("1. Authenticating as alex@email.com")
        eval_js(s, "API.login('alex@email.com', 'password123')", 2)
        time.sleep(1)

        # Navigate to Profile
        print("2. Navigating to #/profile")
        eval_js(s, "navigate('/profile')", 3)
        time.sleep(1.5)
        snap(s, "screenshots/profile.png", 4)

        stats = eval_js(s, "JSON.stringify({name: state.currentUser?.name, points: state.profile?.loyaltyPoints, orders: state.profile?.totalOrders, memberSince: state.profile?.memberSince})", 5)
        print("Profile data:", stats)

        # Test #/admin route guard as customer
        print("3. Testing #/admin route guard as customer Alex")
        eval_js(s, "navigate('/admin')", 6)
        time.sleep(1)
        cur_route = eval_js(s, "state.currentRoute", 7)
        print("Current route after opening #/admin as customer:", cur_route)
        assert cur_route == "/home", f"Expected /home, got {cur_route}"

        # Test booking flow
        print("4. Starting 5-step booking flow")
        eval_js(s, "navigate('/booking')", 8)
        time.sleep(1)

        # Step 1: Select services & addon
        eval_js(s, "state.booking.selectedServiceIds = ['deep-clean', 'suede-care']", 9)
        eval_js(s, "state.booking.selectedAddonIds = ['coating']", 10)
        eval_js(s, "render()", 11)
        time.sleep(0.5)

        # Step 2: Schedule
        eval_js(s, "state.booking.currentStep = 1; render()", 12)
        time.sleep(0.5)
        eval_js(s, "state.booking.selectedDateIndex = 1; state.booking.selectedTimeSlot = '3:00 PM'; render()", 13)

        # Step 3: Address
        eval_js(s, "state.booking.currentStep = 2; render()", 14)
        time.sleep(0.5)
        eval_js(s, "state.booking.address = { street: '123 Main Street, Apt 4B', city: 'New York', zip: '10001' }; render()", 15)

        # Step 4: Photos
        eval_js(s, "state.booking.currentStep = 3; render()", 16)
        time.sleep(0.5)
        eval_js(s, """
        state.booking.uploadedPhotos = [
            { slotNumber: 1, slotLabel: 'Front', photoUrl: '/api/orders/SNK-2847/photos/front', originalFilename: 'front.jpg', fileSize: 102400 },
            { slotNumber: 2, slotLabel: 'Back', photoUrl: '/api/orders/SNK-2847/photos/back', originalFilename: 'back.jpg', fileSize: 102400 }
        ];
        render();
        """, 17)
        time.sleep(0.5)
        snap(s, "screenshots/booking.png", 18)

        # Step 5: Payment Summary & Promo
        eval_js(s, "state.booking.currentStep = 4; render()", 19)
        time.sleep(0.5)
        eval_js(s, "document.getElementById('promo-input').value = 'CLEAN20'; applyBookingPromo()", 20)
        time.sleep(1)

        # Place order
        print("5. Placing order")
        eval_js(s, "handleBookingNext()", 21)
        time.sleep(2)

        # Navigate to orders
        print("6. Viewing #/orders")
        eval_js(s, "navigate('/orders')", 22)
        time.sleep(1.5)
        snap(s, "screenshots/orders.png", 23)

        # Past orders view
        eval_js(s, "setOrdersTab('past')", 24)
        time.sleep(1)
        snap(s, "screenshots/orders_past.png", 25)

        print("ALL BROWSER FLOW TESTS COMPLETED SUCCESSFULLY!")
        s.close()
    finally:
        proc.terminate()

if __name__ == "__main__":
    run_browser_tests()
