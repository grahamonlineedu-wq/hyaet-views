import requests
import json

url = "http://localhost:9090"

test_payload = {
    "token": "example_canary_token_123",
    "memo": "Portfolio Config Honeytoken",
    "channel": "Webhook",
    "additional_data": {
        "src_ip": "127.0.0.1",
        "user_agent": "Mozilla/5.0 (Android; Mobile)",
        "trigger_time": "2026-07-18"
    }
}

print("[*] Sending simulated Canarytoken trigger payload to listener...")
try:
    response = requests.post(url, json=test_payload, timeout=5)
    print(f"[+] Server Response Code: {response.status_code}")
    print(f"[+] Server Response Body: {response.text}")
except requests.exceptions.ConnectionError:
    print("[!] Error: Could not connect to the listener. Is it running on port 9090?")
