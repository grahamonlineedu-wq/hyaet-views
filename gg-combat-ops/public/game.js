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
