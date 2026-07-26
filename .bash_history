pkg update && pkg upgrade -y && pkg install git nodejs python sqlite -y
exit
pkg update && pkg upgrade -y
mkdir -p gg-combat-ops/public
cd gg-combat-ops
npm init -y
npm install express socket.io
# Write backend server.js file
cat << 'EOF' > server.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    const team = Object.keys(players).filter(id => players[id].team === 'Alfa').length 
                 <= Object.keys(players).filter(id => players[id].team === 'Bravo').length 
                 ? 'Alfa' : 'Bravo';

    players[socket.id] = {
        id: socket.id,
        x: team === 'Alfa' ? 100 : 700,
        y: 200,
        team: team,
        weapon: 'M16',
        health: 100
    };

    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = 3000;
http.listen(PORT, () => {
    console.log(`GG combat ops server running on http://localhost:${PORT}`);
});
EOF

# Write index.html to public
cat << 'EOF' > public/index.html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>GG combat ops</title>
    <link rel="stylesheet" href="style.css">
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>
    <div id="game-container">
        <header>
            <span id="game-title">GG combat ops</span>
            <span id="team-info">Joining squad...</span>
        </header>
        <canvas id="gameCanvas" width="800" height="400"></canvas>
        <div id="controls">
            <div id="joystick-zone">Drag to Move</div>
            <div id="weapon-select">
                <button onclick="changeWeapon('M16')">M16</button>
                <button onclick="changeWeapon('AK117')">AK 117</button>
                <button onclick="changeWeapon('LR7')">LR7 Sniper</button>
            </div>
        </div>
    </div>
    <script src="game.js"></script>
</body>
</html>
EOF

# Write style.css to public
cat << 'EOF' > public/style.css
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    user-select: none;
}
body {
    background-color: #1a1a1a;
    color: #fff;
    font-family: sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden;
}
#game-container {
    width: 100vw;
    max-width: 850px;
    height: 100vh;
    display: flex;
    flex-direction: column;
}
header {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    background: #333;
}
#game-title {
    font-weight: bold;
    color: #ffcc00;
}
canvas {
    background: #252525;
    width: 100%;
    height: auto;
    border-bottom: 2px solid #444;
}
#controls {
    flex-grow: 1;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: #111;
    padding: 10px;
}
#joystick-zone {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
}
#weapon-select button {
    padding: 10px 15px;
    margin: 5px;
    background: #444;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}
#weapon-select button:active {
    background: #ffcc00;
    color: #000;
}
EOF

# Write game.js to public
cat << 'EOF' > public/game.js
const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const teamInfo = document.getElementById('team-info');

let localPlayer = null;
let remotePlayers = {};
let touchStart = null;
let movementVector = { x: 0, y: 0 };

socket.on('currentPlayers', (players) => {
    Object.keys(players).forEach((id) => {
        if (id === socket.id) {
            localPlayer = players[id];
            teamInfo.textContent = `Team: ${localPlayer.team} | Weapon: ${localPlayer.weapon}`;
        } else {
            remotePlayers[id] = players[id];
        }
    });
});

socket.on('newPlayer', (playerInfo) => {
    remotePlayers[playerInfo.id] = playerInfo;
});

socket.on('playerMoved', (playerInfo) => {
    if (remotePlayers[playerInfo.id]) {
        remotePlayers[playerInfo.id].x = playerInfo.x;
        remotePlayers[playerInfo.id].y = playerInfo.y;
    }
});

socket.on('playerDisconnected', (id) => {
    delete remotePlayers[id];
});

const joystick = document.getElementById('joystick-zone');
joystick.addEventListener('touchstart', (e) => {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
});

joystick.addEventListener('touchmove', (e) => {
    if (!touchStart || !localPlayer) return;
    const dx = e.touches[0].clientX - touchStart.x;
    const dy = e.touches[0].clientY - touchStart.y;
    const distance = Math.min(Math.sqrt(dx*dx + dy*dy), 50);
    const angle = Math.atan2(dy, dx);
    
    movementVector.x = Math.cos(angle) * (distance / 10);
    movementVector.y = Math.sin(angle) * (distance / 10);
});

joystick.addEventListener('touchend', () => {
    touchStart = null;
    movementVector = { x: 0, y: 0 };
});

function changeWeapon(type) {
    if (localPlayer) {
        localPlayer.weapon = type;
        teamInfo.textContent = `Team: ${localPlayer.team} | Weapon: ${localPlayer.weapon}`;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (localPlayer && (movementVector.x !== 0 || movementVector.y !== 0)) {
        localPlayer.x = Math.max(20, Math.min(canvas.width - 20, localPlayer.x + movementVector.x));
        localPlayer.y = Math.max(20, Math.min(canvas.height - 20, localPlayer.y + movementVector.y));
        socket.emit('playerMovement', { x: localPlayer.x, y: localPlayer.y });
    }

    // MRAP Obstacle
    ctx.fillStyle = '#8b7355';
    ctx.fillRect(canvas.width / 2 - 40, canvas.height / 2 - 25, 80, 50);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.fillText("MRAP", canvas.width / 2 - 18, canvas.height / 2 + 5);

    // Local Player
    if (localPlayer) {
        ctx.fillStyle = localPlayer.team === 'Alfa' ? '#3399ff' : '#ff3333';
        ctx.beginPath();
        ctx.arc(localPlayer.x, localPlayer.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`You (${localPlayer.weapon})`, localPlayer.x - 20, localPlayer.y - 20);
    }

    // Others
    Object.keys(remotePlayers).forEach((id) => {
        const rp = remotePlayers[id];
        ctx.fillStyle = rp.team === 'Alfa' ? '#3399ff' : '#ff3333';
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(rp.team, rp.x - 15, rp.y - 20);
    });

    requestAnimationFrame(gameLoop);
}

gameLoop();
EOF

node server.js
