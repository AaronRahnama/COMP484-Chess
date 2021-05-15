//npm install chess.js
//npm install express
//npm install nodemon
//npm install socket.io
//npm install uuid
const MAX_GAMES = 100;
const portNUM = 3000;

const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const httpServer = require('http').createServer(app);
const { Chess } = require('./chess.js');
const io = require('socket.io')(httpServer, { cors: { origin: '*' } });
const cors = require('cors');

let GAME_COUNT = 0;
let GAMES = [];

app.use(cors({ origin: true, credentials: true }));
app.use((req, res, next) => {
  const { method, url } = req;
  console.log('method:', method.toLowerCase(), url);
  res.cookie('test', 'test_' + Date.now(), { httpOnly: false });
  next();
});

// ================= Handle HTTP requests  =================
app.use(express.urlencoded({ extended: true }), express.json(), express.static(__dirname + '/chess'));

app.get('/create', (req, res) => {
  res.sendFile(__dirname + '/username.html');
});

app.get('/join', (req, res) => {
  // Send game files
  res.sendFile(__dirname + '/chess/chess.html');
});

app.post('/create', (req, res) => {
  let game_id;
  let user_id;
  if (GAME_COUNT < MAX_GAMES) {
    // Grab the chosen orienation from creator
    let this_orientation = req.body.orientation;
    if (this_orientation == 'random') {
      let rand = Math.floor(Math.random() * 2);
      if (rand == 0) {
        this_orientation = 'white';
      } else {
        this_orientation = 'black';
      }
    }
    GAMES[GAME_COUNT] = CreateGame(this_orientation);
    // Send Game ID
    // res.cookie('game_id', GAMES[GAME_COUNT].game_id, { sameSite: 'strict', path: '/' });
    game_id = GAMES[GAME_COUNT].game_id;
    user_id = GAMES[GAME_COUNT].user_id;

    res.cookie('game_id', GAMES[GAME_COUNT].game_id, { sameSite: 'lax', path: '/', httpOnly: false });
    // Send User ID
    res.cookie('user_id', GAMES[GAME_COUNT].user_id, { sameSite: 'lax', path: '/', httpOnly: false });
    // Send board orientation
    switch (this_orientation) {
      case 'white':
        res.cookie('orientation', 'white', { sameSite: 'lax', path: '/', httpOnly: false });
        break;
      default:
        res.cookie('orientation', 'black', { sameSite: 'lax', path: '/', httpOnly: false });
        break;
    }
    GAME_COUNT++;
  } else {
    // Too many games in session
    console.log('App.post(/create): Too many games in session.');
  }
  // res.sendFile(__dirname + '/chess/chess.html');
  
  res.json({ game_id, user_id, orientation: req.body.orientation });
});

//=================================================== New Game ===================================================
function CreateGame(orientation) {
  // create a chessGame object and increment number of games.
  let chessGame = {
    game: new Chess(),
    game_id: uuidv4(),
    user_id: uuidv4(),
    user_id2: uuidv4(),
    uid2_taken: false,
    user2_orientation: 'white',
  };
  if (orientation == 'white') chessGame.user2_orientation = 'black';
  else chessGame.user2_orientation = 'white';
  return chessGame;
}

// Utility function to find the index
function findIndexByGameID(this_gid) {
  let ans = -1;
  for (let ii = 0; ii < GAMES.length; ii++) {
    if (GAMES[ii].game_id == this_gid) {
      //console.log("findIndexByGameID: " + this_gid);
      ans = ii;
      break;
    }
  }
  return ans;
}

function removeGame(index) {
  //console.log("removeGame: " + GAMES[index].game_id);
  GAMES.splice(index, 1);
  GAME_COUNT--;
}

// =================================================== Log Room messages ===================================================
// io.of("/").adapter.on("create-room", (room) => {
//     console.log(`room ${room} was created`);
// });

// io.of("/").adapter.on("join-room", (room, id) => {
//     console.log(`socket ${id} has joined room ${room}`);
// });

// io.of("/").adapter.on("leave-room", (room, id) => {
//     console.log(`socket ${id} has left room ${room}`);
// });

// Delete game instance if all players leave.
io.of('/').adapter.on('delete-room', (room, id) => {
  let index = findIndexByGameID(room);
  if (index != -1) removeGame(index);
  // else
  //     console.log("Room does not match any game.");
  // console.log(`room ${room} was deleted`);
});

// =================================================== Handle socket messages ===================================================

io.on('connection', (socket) => {
  let sender = socket.id;
  socket.on('join', (this_gid, this_user) => {
    let index = findIndexByGameID(this_gid);
    if (index != -1) {
      console.log(this_gid, this_user);
      //console.log("Socket.on(join): found index from game_id");
      // Check if the incoming connection is a new user or returning user
      let secondUser = this_user != GAMES[index].user_id && GAMES[index].uid2_taken == false;
      let returningUser = this_user == GAMES[index].user_id || this_user == GAMES[index].user_id2;
      if (secondUser) {
        // Send the second User ID and the proper board orientation to the new user.
        socket.emit('cookie', { UID: GAMES[index].user_id2, color: GAMES[index].user2_orientation });
        GAMES[index].uid2_taken = true;
      }
      if (secondUser || returningUser) {
        // send game update
        //console.log("Socket.on(join): Attempt to join game room.");
        socket.join(GAMES[index].game_id);
        socket.emit('update', GAMES[index].game.fen());
      } else {
        // Connection attempt is a third unknown user.
        console.log('Socket.on(join): Third User attempt.');
      }
    }
  });

  // Move received from player, Validate move then send to other player.
  socket.on('move', (data) => {
    // console.log("Move Received.");
    // console.log(data);
    let index = findIndexByGameID(data.RM);
    // handle move from client (check if valid)
    if (index != -1) {
      let move = GAMES[index].game.move({
        from: data.SRC,
        to: data.TGT,
        promotion: data.PRM,
      });

      if (move != null) {
        //if move is valid send move
        socket.to(data.RM).emit('move', { SRC: data.SRC, TGT: data.TGT, PRM: data.PRM });
      } else {
        // move was invalid send server game state to fix client game state.
        socket.to(socket.id).emit('update', GAMES[index].game.fen());
      }
    }
  });
});

//=================================================== LISTENERS ===================================================

// app.listen(portNUM,()=>{
//     console.log('Listening on ' + portNUM);
// });
httpServer.listen(portNUM, () => {
  console.log('Listening on Port ' + portNUM);
});

//=================================================== Restart timestamp ===================================================
let time_data = new Date();
let now = time_data.getHours() + ':' + time_data.getMinutes() + ':' + time_data.getSeconds();
console.log('Restarted at ' + now);
