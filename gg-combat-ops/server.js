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
