function run_display() {
    const game = new Chess();
    function onDragStart(source, piece, position, orientation) {
        console.log('Drag started:');
        console.log('Source: ' + source);
        console.log('Piece: ' + piece);
        console.log('Position: ' + Chessboard.objToFen(position));
        console.log('Orientation: ' + orientation);
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        toggleValidMoves(source);
    }

    function toggleValidMoves(source) {
        let moves = game.moves({square:source,verbose:true});
        for(let i = 0;i < moves.length;i++)
        {
            console.log(moves[i]);
            let $square = $('.square-' + moves[i].to);
            $square.toggleClass('dot');
        }
    }

    function onDrop(source, target, piece, newPos, oldPos, orientation) {
        console.log('Source: ' + source);
        console.log('Target: ' + target);
        console.log('Piece: ' + piece);
        console.log('New position: ' + Chessboard.objToFen(newPos));
        console.log('Old position: ' + Chessboard.objToFen(oldPos));
        console.log('Orientation: ' + orientation);
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        toggleValidMoves(source);
        // see if the move is legal
        let move = game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
        })
        // illegal move
        if (move === null) return 'snapback'
    }

    function onDragMove(newLocation, oldLocation, source,
        piece, position, orientation) {
        console.log('New location: ' + newLocation)
        console.log('Old location: ' + oldLocation)
        console.log('Source: ' + source)
        console.log('Piece: ' + piece)
        console.log('Position: ' + Chessboard.objToFen(position))
        console.log('Orientation: ' + orientation)
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    }

    const config = {
        draggable: true,
        dropOffBoard: 'snapback',
        onDragStart: onDragStart,
        onDragMove: onDragMove,
        onDrop: onDrop,
        position: 'start'
    };
    const board = Chessboard('board1', config);
}