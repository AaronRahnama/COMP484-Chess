
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
    if(urlQuery.has("game_id"))
    {
        config.orientation = 'black';
        game_id = urlQuery.get("game_id");
    }
    else
    {
        game_id = getCookie('game_id');
    }

    

    const board = Chessboard('board1', config);
    $(window).resize(board.resize);

    let promoting = false;
    let promotion_src = '';
    let promotion_tgt = '';

    // ========================= Send Join message for Game room ==========================
    socket.on("connect", () => {
        //console.log("Checking Connection...");
        //console.log(socket.connected);
        socket.emit("join",game_id);
        // show connection
    });


    // ========================= Handle incoming game moves ==========================
    socket.on("move", (data) => {
        console.log(data)
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
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    //console.log("game_id:" + game_id);

    // ==================== Start of chess UI code ========================


    function onDragStart(source, piece, position, orientation) {
        // console.log('Drag started:');
        // console.log('Source: ' + source);
        // console.log('Piece: ' + piece);
        // console.log('Position: ' + Chessboard.objToFen(position));
        // console.log('Orientation: ' + orientation);
        // console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        if (!promoting) {
            toggleValidMoves(source);
        }
    }

    function toggleValidMoves(source) {
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

    function onDrop(source, target, piece, newPos, oldPos, orientation) {
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

    function containsSquare(moveList, this_square) {
        let ans = false;
        for (let i = 0; i < moveList.length; i++) {
            if (moveList[i].to == this_square) {
                ans = true;
                break;
            }
        }
        return ans;
    }

    function onSnapEnd() {
        board.position(game.fen());
    }

    function makeMove(src, tgt, prm) {
        let move = game.move({
            from: src,
            to: tgt,
            promotion: prm
        });
        // illegal move
        if (move === null) {
            return 'snapback'
        }
        else {
            //console.log("EMIT");
            socket.emit("move", { SRC: src, TGT: tgt, PRM: prm, RM: game_id }, (response) => {
                console.log(response.status);
            });
        }
    }

    // ====================== Promotion box ====================
    function togglePromotionBox() {

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
        //console.log("Checking promotion");
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
        board.position(game.fen());
        togglePromotionBox();
    }
}