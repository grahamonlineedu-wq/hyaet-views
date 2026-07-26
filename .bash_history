ssh-keygen -t ed25519 -C "your_email@example.com"
exit
pkg update && pkg upgrade -y
pkg install git nano curl wget -y
pkg install vim -y.
pkg install git -y
git config --global user.name "grahamonlineedu-wq"git config --global user.email "grahamonline.edu@gmail.com"ssh-keygen -t ed25519 -C "grahamonline.edu@gmail.com"
ls
ssh-keygen -t ed25519
exit
rm -rf ~/.ssh
rm -rf ~/projects
exit
nano style.css
nano main.js
nano index.html
npx serve
exit
mkdir ~/projects
cd ~/projects
git init
git push
gitpush
nano index.html
npm run dev
ls
npm run dev
exit
killall -9 node python 2>/dev/null
rm -rf ~/projects
mkdir ~/projects
cd ~/projects
nano index.html
nano style.css
nano main.js
npm run dev
exit
killall -9 node python 2>/dev/null
rm -rf ~/projects
mkdir ~/projects
cd ~/projects
nano index.html
nano style.css
nano main.js
python -m http.server 8000 --bind 127.0.0.1
nano index.html
python -m http.server 8000 --bind 127.0.0.1
termux-wake-unlock
exit
package install tcdump
tcdump -iwlan0-c 10
exit
pkg update && pkg upgrade
termux-setup-storage
pkg update && pkg upgrade
termux-setup-storage
ls
cd <directory>
git clone <repository-url>
pkg install tcpdump
tcpdump-iwlan0 -c 10
exit
pkg update && pkg upgrade
termux-setup-storage
y
exit
pkg update && pkg upgrade
termux-setup-storage
y
exit
cd /files/home/attat-services/
python -m http.server 8158
bg
cd ~/projects
ls
nano index.html
nano main.js
nano style.css
python -m http.server 8000 --bind 127.0.0.1
# Move back to your main directory
cd ~
# Create a new folder for the service app
mkdir attat-services
# Navigate into it
cd attat-services
# 1. Make sure you are in the project folder
cd ~/attat-services
# 2. Initialize Git (industry standard for tracking code changes)
git init
# 3. Create a clean folder structure
mkdir -p assets/css assets/js
# 4. Create your core files
touch index.html assets/css/style.css assets/js/app.js
# 5. Verify everything is in place
ls -R
nano index.html
nano assets/css/style.css
nano assets/js/app.js
git add .
git commit -m "feat: initial commit for attat-services MVP prototype"
8001
cd ~/attat-services
python -m http.server 8001 --bind 127.0.0.1
git add .
git commit -m "feat: completed working mvp with secure otp and tracker"
termux-setup-storage
rm -rf ~/storage
termux-setup-storage
ln -s ~/attat-services ~/storage/shared/Documents/attat-services
python -m http.server 8001 --bind 127.0.0.1
cd ~/attat-services
python -m http.server 8001 --bind 127.0.0.1
ls
ls -R
ls -R ~/projects
ls -d ~/projects ~/attat-services 2>/dev/null
python -m http.server 8001 --bind 127.0.0.1
let selectedServiceType = "";
let generatedOTP = "";
// --- STATE MEMORY MANAGEMENT ---
// Save the current app state to local storage
function saveAppState(state, details = {}) {
pkg && pkg update
termux-setup-storage
ls
exit
pkg upgrade && pkg update
exit
pkg update && pkg upgrade
exit
pkg install git python python-pip -y
git clone https://github.com/sundowndev/phoneinfoga.git
cd phoneinfoga
git clone https://github.com/sherlock-project/sherlock.git
cd sherlock
git clone https://github.com/iojw/socialscan.git
cd socialscan
pip install -r requirements.txt
pip install .
pip install socialscan
socialscan target - 1owolorichy@gmail.com
cd ..
pip install -r requirements.txt
python sherlock.py 1owolorichy
cd sherlock
pip install -r requirements.txt
python sherlock.py 1owolorichy
pkg install python git
exit
pkg update && pkg upgrade
pkg install python git
git clone https://github.com/sundowndev/phoneinfoga.git
cd phoneinfoga
pip install -r requirements.txt
exit
# Go to your home directory
cd ~
# Create a structured OSINT directory
mkdir -p OSINT/tools OSINT/projects OSINT/reports
# Navigate into your tools directory
cd OSINT/tools
# Use 'sudo apt install' on Linux or 'pkg install' on Termux
pkg install git python python-pip curl wget libxslt libxml2 -y
git clone https://github.com/sherlock-project/sherlock.git
cd sherlock && pip install -r requirements.txt && cd ..
git clone https://github.com/laramies/theHarvester.git
cd theHarvester && pip install -r requirements.txt && cd ..
pip install holehe
sudo apt install tor proxychains -y
pip3 install holehe
target1owolorichy@gmail.com
pkg install python python-pip -y
python -m holehe 1owolorichy@gmail.com
holehe 1owolorichy@gmail.com
holehe --only-used 1owolorichy@gmail.com
pip install ghunt
ghunt login
ghunt email 1owolorichy@gmail.com
cd ~/phoneinfoga/sherlock/sherlock
python sherlock.py 1owolorichy
# 1. Install the pre-compiled numpy binary directly from Termux
pkg install python-numpy -y
# 1. Jump straight into your correct Sherlock folder
cd ~/OSINT/tools/sherlock/sherlock
# 2. Run your handle tracking tool
python sherlock.py 1owolorichy
pip install ghunt
exit
FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
brew install corelocationcli
CoreLocationCLI --watch --json
Get Current Location
Get Contents of URL
termux-location -p gps -r once
pkg install python -y
mkdir ~/portfolio && cd ~/portfolio
echo "<h1>My Personal Portfolio under development</h1>" > index.html
python -m http.server 8080
exit
cat << 'EOF' > ~/portfolio/webhook_listener.py
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
EOF

python ~/portfolio/webhook_listener.py
exit
cat << 'EOF' > ~/portfolio/webhook_listener.py
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
EOF

python ~/portfolio/webhook_listener.py
exit
# 1. Force kill any old hanging processes on port 8158
fuser -k 8158/tcp
# 2. Hard navigate to your home service project directory
cd /files/home/attat-services/
# 3. Boot up the Python server freshly on your port
python3 -m http.server 8158
pwd && ls -F
cd attat-services
python3 -m http.server 8158
# 1. Stop the current server session
Ctrl + C
# 2. Kill any hidden background port activity
fuser -k 8158/tcp
# 3. Double check that app.html is sitting ready in your folder
ls
# 4. Fire up the Python server again
python3 -m http.server 8158
ls -la
# 1. Kill any active instance running on port 8158
fuser -k 8158/tcp
# 2. Make sure you are inside the correct project folder
cd $HOME/attat-services/
# 3. Double check your file is there
ls index.html
# 4. Start up the Python web engine
python3 -m http.server 8158
# 1. Ensure you are in your project root
cd $HOME/attat-services/
# 2. Create the assets structure all at once
mkdir -p assets/css assets/images
# 3. Initialize Git for version control tracking
git init
# 4. Check your setup structure to confirm everything is in place
ls -F
ls
python3 -m http.server 8158
exit
# 1. Kill any current server instance on port 8158
fuser -k 8158/tcp
# 2. Change directory back to your Home Service directory
cd $HOME/attat-services/
# 3. Fire the Python web engine back up
python3 -m http.server 8158
# Update your local packages and pull down Flask instantly
pkg update -y
pip install flask
touch server.py
import random
from flask import Flask, request, jsonify, send_from_directory
app = Flask(__name__)
# Simulated in-memory secure datastore to track issued tokens
active_sessions = {}
# 1. Route to serve your untouched index.html front-end interface automatically
@app.route('/')
def serve_frontend():
# 2. Live API endpoint triggered when "Proceed to Secure Verification" is tapped
@app.route('/api/request-otp', methods=['POST'])
def request_otp():
# 3. Live API endpoint to match and finalize the user's entered OTP
@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
if __name__ == '__main__':
    print("\n🚀 Attat AGHS Production Server Firing Up...")
python3 server.py
ls
python3 server.py
npm install twilio express
node server.js
pip install flask twilio
python server.py
python server.py.
python server.py
exit
cd ~/attat-services
python server.py
exit
cd ~/attat-services
python server.py
mkdir -p templates
mv index.html templates/
ls templates
python server.py
exit
cd/~/attat-services
python server.py
exit
cd ~/attat-services
python server.py
exit
cd ~/attat-services
ls
mkdir -p templates static
mv index.html templates/ 2>/dev/null
mv style.css static/ 2>/dev/null
nano templates/index.html
nano static/style.css
python server.py
exit
STR=Setup\ storage;DOA="Setup 'draw over apps' (Press ENTER)";IBO="Setup 'ignore battery optimizations' (Press ENTER)";SBP="Setup & Background pop-ups permissions";ALE="Setup 'allow-external-apps'";ICL=Install\ Clang;ACT=android.settings;PKG=package:com.termux;PT=~/.termux/termux.properties;echo $STR;termux-setup-storage;read -p "$DOA";am start -a $ACT.action.MANAGE_OVERLAY_PERMISSION -d $PKG > /dev/null;read -p "$IBO";am start -a $ACT.IGNORE_BATTERY_OPTIMIZATION_SETTINGS > /dev/null;read -p "$SBP";am start -a $ACT.APPLICATION_DETAILS_SETTINGS -d $PKG > /dev/null;echo $ALE;if [ -f $PT ];then awk '/^#/{print;next }/^\s*allow-external-apps/{gsub(/allow-external-apps.*/,"allow-external-apps=true");found=1}{print $0}END{if(!found)print "allow-external-apps=true"}' $PT > "$TMPDIR/a.tmp" && mv "$TMPDIR/a.tmp" $PT;else mkdir -p $(dirname $PT);echo 'allow-external-apps=true' > $PT;fi;echo $ICL;pkg i clang -y;apt autoremove --purge;apt clean;echo ok
exit
cd ~/Attat-services
cd ~/attat-services
python sercer.py
python server.py
exit
pkg update && pkg upgrade
termux-install-storage
cd ~/archery-folder
ls
cd ~/projects
exit
pkg update && pkg upgrade
termux-setup-storage
cd ~/Grahm's-projects
ls
y
pwd
exit
exit
pkg update && pkg upgrade
exit
pkg upgrade && pkg update
pkg install python git
git clone https://github.com/sundowndev/phoneinfoga.git
exit
# Update package repositories
pkg update && pkg upgrade -y
# Install Node.js and Git
pkg install nodejs git -y
# Verify installation
node -v
npm -v
# Create and enter directory
mkdir hyat-views
cd hyat-views
# Initialize Node.js project
npm init -y
npm install express cors
nano server.js
node server.js
exit
cd ~/hyat-views
ls
nano index.html
nano style.css
nano app.js
nano server.js
nano index.html
cd hyat-views
node server.js
exit
cd hyat-views
node server.js
exit
pkill -f node
clear
cd ~/hyat-views
ls -l
node server.js
mv index_html index.html
ls -l
nano server.js
ls -1
nano server.js
nano index.html
nano style.css
nano server.js
nano app.js
node server.js
nano server.js
node server.js
nano index.html
node server.js
nano server.js
pkill -f node
node server.js
nano style.css
nano index.html
nano app.js
nano style.css
nano index.html
pkill -f node
node server.js
nano style.css
node server.js
nano app.js
pkill -f node
node server.js
nano style.css
pkill -f node
node server.js
nano server.js
pkill -f node
node server.js
nano index.html
pkill -f node
node server.js
nano index.html
nano app.js
pkill -f node
node server.js
nano index.html
pkill -f node
node server.js
nano style.css
nano app.js
nano read.md
node server.js
pkill -f node && node server.js
node server.js
git init
git add .
git commit -m "Initial release: Hyæt Views v1.0 complete security suite"
ls -la server.js index.html style.css app.js README.md
node -c server.js
pkill -f node && node server.js
node server.js
nano app.js
exit
