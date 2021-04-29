//npm install chess
//npm install express
//npm install nodemon
//npm install socket.io

const express = require('express');
const app = express();
const { Chess } = require('./chess.js')
const io = require('socket.io')(80);
//const socket = io("http://localhost");


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
    res.sendFile(__dirname + "/chess/chess.html");
});

app.post('/create',(req,res) => {
    //CreateGame(req.body.user);
    console.log(req.body.user);
});

//=================================================== New Game ===================================================
function CreateGame()
{
    //TODO: CREATE socket connections and associate socket connection to game number
    GAME_ID[GAME_COUNT] = uuidv4();
    GAME[GAME_COUNT] = new Chess();
    GAME_COUNT++;
}


// TODO:
// =================================================== Handle socket messages ===================================================

// handle move from client (check if valid)

// send move to client

//=================================================== LISTENER ===================================================
const portNUM = 3000;
app.listen(portNUM,()=>{
    console.log('Listening on ' + portNUM);
});

//=================================================== Restart timestamp ===================================================
let time_data = new Date();
let now = time_data.getHours() + ":" 
    + time_data.getMinutes() + ":" 
    + time_data.getSeconds();
console.log("Restarted at " + now);