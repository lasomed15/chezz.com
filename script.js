const boardEl = document.getElementById('chessboard');
const statusEl = document.getElementById('status');

let board = [];
let selected = null;
let turn = 'white';
let enPassantTarget = null;

const pieces = {
    wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
    bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟'
};

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

    statusEl.textContent = `${turn.charAt(0).toUpperCase()+turn.slice(1)}'s turn`;
}

// Click logic
function handleClick(row,col){
    const piece = board[row][col];

    if(selected){
        const moves = legalMoves(selected.row, selected.col);
        const validMove = moves.find(m=>m.row===row && m.col===col);
        if(validMove){
            movePiece(selected.row, selected.col, row, col);
            selected = null;
            render();
            return;
        }
        if(piece && ((turn==='white' && isWhite(piece)) || (turn==='black' && isBlack(piece)))){
            selected = {row,col};
        } else {
            selected = null;
        }
    } else {
        if(piece && ((turn==='white' && isWhite(piece)) || (turn==='black' && isBlack(piece)))){
            selected = {row,col};
        }
    }

    render();
}

// Simple linear moves helper
function linearMoves(r,c,directions){
    let moves=[];
    const piece = board[r][c];
    const enemy = isWhite(piece)?isBlack:isWhite;
    directions.forEach(([dr,dc])=>{
        let nr=r+dr,nc=c+dc;
        while(nr>=0 && nr<8 && nc>=0 && nc<8){
            if(!board[nr][nc]) moves.push({row:nr,col:nc});
            else { if(enemy(board[nr][nc])) moves.push({row:nr,col:nc}); break; }
            nr+=dr; nc+=dc;
        }
    });
    return moves;
}

// Legal moves simplified (pawns + knights + basic sliding)
function legalMoves(r,c){
    const piece = board[r][c];
    if(!piece) return [];
    let moves = [];
    const dir = isWhite(piece)?-1:1;
    const enemy = isWhite(piece)?isBlack:isWhite;

    switch(piece[1]){
        case 'P':
            if(!board[r+dir][c]) moves.push({row:r+dir,col:c});
            if(c>0 && enemy(board[r+dir][c-1])) moves.push({row:r+dir,col:c-1});
            if(c<7 && enemy(board[r+dir][c+1])) moves.push({row:r+dir,col:c+1});
            break;
        case 'N':
            [[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2]].forEach(([dr,dc])=>{
                const nr=r+dr,nc=c+dc;
                if(nr>=0 && nr<8 && nc>=0 && nc<8 && (!board[nr][nc] || enemy(board[nr][nc]))) moves.push({row:nr,col:nc});
            });
            break;
        case 'R':
            moves = moves.concat(linearMoves(r,c,[[-1,0],[1,0],[0,-1],[0,1]]));
            break;
        case 'B':
            moves = moves.concat(linearMoves(r,c,[[-1,-1],[-1,1],[1,-1],[1,1]]));
            break;
        case 'Q':
            moves = moves.concat(linearMoves(r,c,[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]));
            break;
        case 'K':
            for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
                const nr=r+dr,nc=c+dc;
                if(nr>=0 && nr<8 && nc>=0 && nc<8 && (!board[nr][nc] || enemy(board[nr][nc]))) moves.push({row:nr,col:nc});
            }
            break;
    }
    return moves;
}

// Move piece
function movePiece(r1,c1,r2,c2){
    board[r2][c2]=board[r1][c1];
    board[r1][c1]='';
    turn = turn==='white'?'black':'white';
}

initBoard();
render();
