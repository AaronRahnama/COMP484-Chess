//npm install chess.js
//npm install express
//npm install nodemon
//npm install socket.io
//npm install uuid

const portNUM = 3000;
const express = require('express');
const app = express();
const { v4: uuidv4 } = require('uuid');
const httpServer = require("http").createServer(app);
const { Chess } = require('./chess.js')
const io = require('socket.io')(httpServer);

//const socket = io("http://localhost");

// read chess.html file into memory


let GAME_COUNT = 0;
let GAME_ID = [];
let GAME = [];

app.use(
    express.urlencoded({extended:true}),
    express.json(),
    express.static(__dirname + "/chess")
);

app.get('/create',(req,res)=>{ 
    res.sendFile(__dirname + "/username.html");
});

app.get('/testgame',(req,res)=>{ 
    res.cookie('game_id',"7da40023-f8dc-4f98-9522-73ec87f19712",{sameSite:'strict'});
    res.sendFile(__dirname + "/chess/chess.html");
});

app.get('/join',(req,res)=>{ 
    let game_id = req.query.game_id;
    //req.cookie('game_id',game_id)
    console.log(game_id);
    res.sendFile(__dirname + "/chess/chess.html");
});

app.post('/create',(req,res) => {
    let gid = CreateGame(req.body.user);
    res.cookie('game_id',gid,{sameSite:'strict'});
    res.sendFile(__dirname + "/chess/chess.html");
    console.log(req.body.user);
});

//=================================================== New Game ===================================================
function CreateGame(name)
{
    //TODO: SEND GAME FILES
    let this_id = uuidv4();
    //GAME_ID[GAME_COUNT] = this_id;
    //GAME[GAME_COUNT] = new Chess();
    GAME_COUNT++;
    return this_id;
}

function findIndexByGameID (game_id)
{
    for(let ii = 0; ii < GAME_ID.length; ii++)
    {
        if(GAME_ID[ii] == game_id)
        {
            break;
        }
    }
    return ii;
}

function removeGame(index)
{
    //GAME_ID.splice(index,1);
    //GAME.splice(index,1);
    GAME_COUNT--;
}


// =================================================== Log Room messages ===================================================
io.of("/").adapter.on("create-room", (room) => {
    console.log(`room ${room} was created`);
});
  
io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
});

io.of("/").adapter.on("leave-room", (room, id) => {
    console.log(`socket ${id} has left room ${room}`);
});

io.of("/").adapter.on("delete-room", (room, id) => {
    removeGame();
    console.log(`room ${room} was deleted`);
});


// TODO:
// =================================================== Handle socket messages ===================================================

io.on("connection", socket =>
{

    socket.on("join",(id) =>
    {
        socket.join(id);
    });

    socket.on("move", (data) =>
    {
        console.log("Move Received.");
        console.log(data);
        // handle move from client (check if valid)
            //if move is valid send move
        socket.to(data.RM).emit("move",{SRC: data.SRC, TGT: data.TGT, PRM: data.PRM});
    });
});

//=================================================== LISTENERS ===================================================


// app.listen(portNUM,()=>{
//     console.log('Listening on ' + portNUM);
// });
httpServer.listen(portNUM, () => {
    console.log("Listening on Port " + portNUM);
});

//=================================================== Restart timestamp ===================================================
let time_data = new Date();
let now = time_data.getHours() + ":" 
    + time_data.getMinutes() + ":" 
    + time_data.getSeconds();
console.log("Restarted at " + now);