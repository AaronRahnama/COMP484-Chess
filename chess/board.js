
// Ridge Tejuco
// Chess.js documentation: https://github.com/jhlywa/chess.js/blob/master/README.md
// Chessboard.js Documentation: https://chessboardjs.com/docs#methods

function run_display() {
    
    const socket = io();
    const game = new Chess();

    let config = {
        draggable: true,
        dropOffBoard: 'snapback',
        onDragStart: onDragStart,
        onSnapEnd: onSnapEnd,
        onDrop: onDrop,
        orientation: 'white',
        //sparePieces: true,
        position: 'start'
    };

    const urlQuery = new URLSearchParams(window.location.search);
    //https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
    let game_id = "";
    let user_id = getCookie('user_id');

    if(urlQuery.has("game_id"))
    {
        // this game id is retrieved from URL query
        game_id = urlQuery.get("game_id");
    }
    else
    {
        // this game id is retrieved from a cookie sent by the server
        game_id = getCookie('game_id');
    }

    config.orientation = getCookie('orientation');

    const webAppURL = "http://localhost:3000/";
    const joinURL = "join?game_id=";
    const joinLink = document.getElementById("joinLink");
    joinLink.value = webAppURL + joinURL + game_id;

    $('.copyButton').click(function()
    {
        // Copy the join link to the clipboard
        navigator.clipboard.writeText(joinLink.value);
    });

    const board = Chessboard('board1', config);
    $(window).resize(board.resize);

    let promoting = false;
    let promotion_src = '';
    let promotion_tgt = '';

    // ======================== Handle incoming messages over TCP/IP sockets ===========================
    socket.on("connect", () => {
        // Send a join message to the server, so the client can join the game room.
        socket.emit("join",game_id,user_id);
    });
 
    socket.on("cookie",(data) =>
    {
        // create cookies from data retrieved from the server.
        document.cookie = "user_id="+ data.UID + ";path=/;SameSite=Strict;"
        document.cookie = "orientation="+ data.color + ";path=/;SameSite=Strict;"
        board.orientation(data.color);
    });

    socket.on("update",(data)=>
    {
        // load the server fen to client game object
        game.load(data);
        // update the GUI position to match game position
        board.position(game.fen());
    });

    // ========================= Handle incoming game moves ==========================
    socket.on("move", (data) => {
        //console.log(data)
        let move = game.move({
            from: data.SRC,
            to: data.TGT,
            promotion: data.PRM // NOTE: always promote to a queen for example simplicity
        });

        // check if illegal move
        if (move === null) return 'snapback'
        else board.position(game.fen()); //update board
    });


    function getCookie(name) {
        //https://stackoverflow.com/questions/10730362/get-cookie-by-name
        // Get value of the cookie obj for the given keyname
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // ==================== Start of chess UI code ========================

    // ==================== EVENTS ========================================

    function onDragStart(source, piece, position, orientation) {
        if(!yourPiece(orientation,piece))
        {
            return false;
        }
        // Piece is picked up
        if (!promoting) {
            toggleValidMoves(source);
        }
    }

    function onDrop(source, target, piece, newPos, oldPos, orientation) {
        // Piece is dropped and move is made.
        if (!promoting) {
            let moves = toggleValidMoves(source);
            // see if the move is legal
            if (is_promotion(piece, target) && containsSquare(moves, target)) {
                //check if promotion is valid
                promotion_tgt = target;
                promotion_src = source;
                console.log(promotion_tgt + promotion_src);
                togglePromotionBox();
            }
            else {
                makeMove(source, target, 'q');
            }
        }
    }

    function onSnapEnd() {
        //Update the board UI to match the chess.js game position, everytime the player moves a piece
        board.position(game.fen());
    }

    function yourPiece(orientation, piece)
    {
        let ans = true;
        if ((orientation === 'white' && piece.search(/^w/) === -1) ||
        (orientation === 'black' && piece.search(/^b/) === -1)) 
        {
            console.log("This is not your piece.");
            ans = false;
        }
        return ans;
    }


    function toggleValidMoves(source) {
        // Show a(potential move) on each square for the given piece on a square.
        let moves = game.moves({ square: source, verbose: true });
        //console.log(moves);
        let last_move = '';
        for (let i = 0; i < moves.length; i++) {
            //console.log(moves[i]);
            let $square = $('.square-' + moves[i].to);
            if (last_move != moves[i].to) {
                $square.toggleClass('dot');
            }
            last_move = moves[i].to;
        }
        return moves;
    }

    function containsSquare(moveList, this_square) {
        //check if the move list contains the target square i.e the move was valid
        let ans = false;
        for (let i = 0; i < moveList.length; i++) {
            if (moveList[i].to == this_square) {
                ans = true;
                break;
            }
        }
        return ans;
    }

    function makeMove(src, tgt, prm) {
        // make the move in client game
        let move = game.move({
            from: src,
            to: tgt,
            promotion: prm
        });
        // if illegal return fix
        if (move === null) {
            return 'snapback'
        }
        else { 
            // Else send move over server to opponent
            socket.emit("move", { SRC: src, TGT: tgt, PRM: prm, RM: game_id }, (response) => {
                console.log(response.status);
            });
        }
    }

    // ====================== Promotion box ====================
    function togglePromotionBox() {
        // switch the css visibility of the promotion box on or off
        // set the promoting flag to disable sending moves until promotion is chosen or canceled.
        if (!promoting)
        {
            promoting = true;
            $("#promotionBox").css("visibility", "visible");
        }
        else
        {
            promoting = false;
            $("#promotionBox").css("visibility", "hidden");
        }
    }

    function is_promotion(piece, target) {
        // Check if the piece is a pawn and if the piece is moved to the end of the board.
        let rank = target.slice(1, 2);
        let type = piece.slice(1, 2);
        //console.log(rank + piece);
        let ans = false;
        if (type == 'P') {
            if (rank == '8' || rank == '1') {
                ans = true;
            }
        }
        return ans;
    }

    const promotion_text = document.getElementsByClassName("promotionText")[0];

    // ========================= Change promotion text ======================
    $('#knightButton').hover(function () {
        promotion_text.innerHTML = "Promotion: Knight";
    });
    $('#queenButton').hover(function () {
        promotion_text.innerHTML = "Promotion: Queen";
    });
    $('#rookButton').hover(function () {
        promotion_text.innerHTML = "Promotion: Rook";
    });
    $('#bishopButton').hover(function () {
        promotion_text.innerHTML = "Promotion: Bishop";
    });
    $('#cancelButton').hover(function () {
        promotion_text.innerHTML = "Promotion: Cancel";
    });

    // ========================== Handle Promotion Choice ==================
    $('#knightButton').click(function () {
        updatePromotion('n');
    });
    $('#queenButton').click(function () {
        updatePromotion('q');
    });
    $('#rookButton').click(function () {
        updatePromotion('r');
    });
    $('#bishopButton').click(function () {
        updatePromotion('b');
    });
    $('#cancelButton').click(function () {
        togglePromotionBox();
    });

    function updatePromotion(choice) {
        makeMove(promotion_src, promotion_tgt, choice)
        // update board UI to current position
        board.position(game.fen());
        // turn off the promotion box UI
        togglePromotionBox();
    }
}