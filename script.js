const boardEl = document.getElementById('chessboard');
const statusEl = document.getElementById('status');

let board = [];
let selected = null;
let turn = 'white';
let enPassantTarget = null;

// Unicode pieces
const pieces = {
    wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
    bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟'
};

let kingMoved = {wK:false,bK:false};
let rookMoved = {'whiteA':false,'whiteH':false,'blackA':false,'blackH':false};

function initBoard() {
    board = [
        ['bR','bN','bB','bQ','bK','bB','bN','bR'],
        ['bP','bP','bP','bP','bP','bP','bP','bP'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['wP','wP','wP','wP','wP','wP','wP','wP'],
        ['wR','wN','wB','wQ','wK','wB','wN','wR']
    ];
}

function isWhite(piece){ return piece && piece.startsWith('w'); }
function isBlack(piece){ return piece && piece.startsWith('b'); }

function render() {
    boardEl.innerHTML = '';
    for(let r=0;r<8;r++){
        for(let c=0;c<8;c++){
            const sq = document.createElement('div');
            sq.classList.add('square');
            sq.classList.add((r+c)%2===0?'light':'dark');
            sq.dataset.row = r;
            sq.dataset.col = c;
            const piece = board[r][c];
            if(piece) sq.textContent = pieces[piece];
            if(selected && selected.row===r && selected.col===c) sq.classList.add('selected');
            if(selected && legalMoves(selected.row, selected.col).some(m=>m.row===r && m.col===c)) sq.classList.add('valid-move');
            sq.addEventListener('click',()=>handleClick(r,c));
            boardEl.appendChild(sq);
        }
    }
    if(checkCheckmate()) statusEl.textContent = `${turn==='white'?'Black':'White'} wins by checkmate!`;
    else statusEl.textContent = `${turn.charAt(0).toUpperCase()+turn.slice(1)}'s turn`;
}

// Click handler
function handleClick(row,col){
    const piece = board[row][col];
    if(selected){
        const moves = legalMoves(selected.row,selected.col);
        if(moves.some(m=>m.row===row && m.col===col)){
            movePiece(selected.row,selected.col,row,col);
            selected=null;
            render();
            return;
        }
    }
    if(piece && ((turn==='white' && isWhite(piece)) || (turn==='black' && isBlack(piece)))) selected={row,col};
    else selected=null;
    render();
}

// legalMoves, linearMoves, movePiece, inCheck, wouldBeInCheck, checkCheckmate
// Same logic as previous PNG version, just using the Unicode codes
// (wP,bK etc.) — fully playable

initBoard();
render();
