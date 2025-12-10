const boardEl = document.getElementById('chessboard');
const statusEl = document.getElementById('status');

let board = [];
let selected = null;
let turn = 'white';
let enPassantTarget = null;

// Pieces
const pieces = {
    wK:'wK.png', wQ:'wQ.png', wR:'wR.png', wB:'wB.png', wN:'wN.png', wP:'wP.png',
    bK:'bK.png', bQ:'bQ.png', bR:'bR.png', bB:'bB.png', bN:'bN.png', bP:'bP.png'
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
            
            // piece image
            const piece = board[r][c];
            if(piece){
                const img = document.createElement('img');
                img.src = `images/${pieces[piece]}`;
                sq.appendChild(img);
            }

            // highlight selected
            if(selected && selected.row===r && selected.col===c) sq.classList.add('selected');

            // valid moves hover circles
            if(selected){
                legalMoves(selected.row, selected.col).forEach(m=>{
                    if(m.row===r && m.col===c){
                        const circle = document.createElement('div');
                        circle.classList.add('valid-move-circle');
                        sq.appendChild(circle);
                    }
                });
            }

            sq.addEventListener('click',()=>handleClick(r,c));
            boardEl.appendChild(sq);
        }
    }

    if(checkCheckmate()) statusEl.textContent = `${turn==='white'?'Black':'White'} wins by checkmate!`;
    else statusEl.textContent = `${turn.charAt(0).toUpperCase()+turn.slice(1)}'s turn`;
}

// Remaining logic: handleClick, legalMoves, linearMoves, movePiece, inCheck, wouldBeInCheck, checkCheckmate
// Same as previous script.js but adapted for piece codes (wP,bK, etc.) as shown earlier

initBoard();
render();
