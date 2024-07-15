const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer();
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins, adjust as necessary for security
  }
});

let players = [];
let gameState = {
  board: Array(9).fill(null),
  isXNext: true,
};

io.on('connection', (socket) => {
  if (players.length >= 2) {
    console.log('More than two players attempted to connect. Connection closed.');
    socket.disconnect(); // Only allow two players
    return;
  }

  players.push(socket);
  console.log('New player connected');

  // Send the initial game state to the new player
  socket.emit('gameState', gameState);

  socket.on('move', (data) => {
    console.log('Received move from client:', data);
    gameState = data;

    // Broadcast the game state to both players
    io.emit('gameState', gameState);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected');
    players = players.filter((player) => player !== socket);
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Socket.io server is running on http://localhost:${PORT}`);
});

