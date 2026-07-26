import json
from http.server import BaseHTTPRequestHandler, HTTPServer

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Read the length of the incoming alert data
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        # Parse the JSON payload from Canarytokens
        try:
            alert_payload = json.loads(post_data.decode('utf-8'))
            print("\n[!] ALERT: Canarytoken Triggered!")
            print(json.dumps(alert_payload, indent=4))
        except Exception as e:
            print(f"\n[!] Received non-JSON or malformed payload: {e}")
            print(post_data.decode('utf-8'))

        # Send a 200 OK response back to the Canarytoken server
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"status":"success"}')

def run(port=9090):
    server_address = ('', port)
    httpd = HTTPServer(server_address, WebhookHandler)
    print(f"[*] Local Webhook Listener running on port {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Shutting down listener.")
        httpd.server_close()

if __name__ == '__main__':
    run()
