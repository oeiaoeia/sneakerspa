import sys
import time
import json
import socket
import base64
import urllib.request
import subprocess

port = 9238
user_data = f"/tmp/chrome_snap_{port}"

cmd = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "--headless",
    "--disable-gpu",
    f"--remote-debugging-port={port}",
    f"--user-data-dir={user_data}",
    "--window-size=412,915",
    "http://localhost:8080/#/admin"
]
proc = subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(2)

try:
    resp = urllib.request.urlopen(f"http://localhost:{port}/json")
    targets = json.loads(resp.read().decode())
    page_target = next(t for t in targets if t.get("type") == "page")
    ws_url = page_target["webSocketDebuggerUrl"]

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

    def send_ws(msg):
        data = msg.encode('utf-8')
        length = len(data)
        frame = bytearray([0x81])
        mask = [0x12, 0x34, 0x56, 0x78]
        if length <= 125:
            frame.append(0x80 | length)
        elif length <= 65535:
            frame.append(0x80 | 126)
            frame.extend(length.to_bytes(2, 'big'))
        else:
            frame.append(0x80 | 127)
            frame.extend(length.to_bytes(8, 'big'))
        frame.extend(mask)
        frame.extend(bytearray(b ^ mask[i % 4] for i, b in enumerate(data)))
        s.sendall(frame)

    buffer = bytearray()
    def read_message():
        global buffer
        while True:
            if len(buffer) >= 2:
                payload_len = buffer[1] & 0x7F
                offset = 2
                if payload_len == 126:
                    if len(buffer) >= 4:
                        payload_len = int.from_bytes(buffer[2:4], 'big')
                        offset = 4
                    else:
                        chunk = s.recv(65536)
                        if not chunk: break
                        buffer.extend(chunk)
                        continue
                elif payload_len == 127:
                    if len(buffer) >= 10:
                        payload_len = int.from_bytes(buffer[2:10], 'big')
                        offset = 10
                    else:
                        chunk = s.recv(65536)
                        if not chunk: break
                        buffer.extend(chunk)
                        continue

                total_frame = offset + payload_len
                if len(buffer) >= total_frame:
                    payload = buffer[offset:total_frame].decode('utf-8', errors='ignore')
                    buffer = buffer[total_frame:]
                    return json.loads(payload)

            chunk = s.recv(65536)
            if not chunk:
                break
            buffer.extend(chunk)

    # Login as admin
    eval_script = """
    (async () => {
      await API.login('admin@sneakerspa.com', 'admin123');
      state.currentRoute = '/admin';
      await render();
      return 'READY';
    })()
    """
    send_ws(json.dumps({"id": 1, "method": "Runtime.evaluate", "params": {"expression": eval_script, "awaitPromise": True}}))
    msg = read_message()
    time.sleep(1)

    # Capture screenshot
    send_ws(json.dumps({"id": 2, "method": "Page.captureScreenshot", "params": {"format": "png"}}))
    snap_res = read_message()
    if snap_res and "result" in snap_res and "data" in snap_res["result"]:
        img_bytes = base64.b64decode(snap_res["result"]["data"])
        with open("screenshots/admin.png", "wb") as f:
            f.write(img_bytes)
        print("Captured screenshots/admin.png successfully!")
finally:
    proc.terminate()
