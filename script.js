const boardEl = document.getElementById('chessboard');
const statusEl = document.getElementById('status');

let board = [];
let selected = null;
let turn = 'white';
let enPassantTarget = null;

// Piece image codes
const pieces = {
    wK:'wK.png', wQ:'wQ.png', wR:'wR.png', wB:'wB.png', wN:'wN.png', wP:'wP.png',
    bK:'bK.png', bQ:'bQ.png', bR:'bR.png', bB:'bB.png', bN:'bN.png', bP:'bP.png'
};

// Track moves for castling
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
            if(piece){
                const img = document.createElement('img');
                img.src = `images/${pieces[piece]}`;
                sq.appendChild(img);
            }
            if(selected && selected.row===r && selected.col===c) sq.classList.add('selected');
            if(selected && legalMoves(selected.row, selected.col).some(m=>m.row===r&&m.col===c)) sq.classList.add('valid-move');
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

// Generate legal moves
function legalMoves(r,c){
    const piece = board[r][c];
    if(!piece) return [];
    let moves = [];
    const dir = isWhite(piece)?-1:1;
    const enemy = isWhite(piece)?isBlack:isWhite;

    const addMove=(nr,nc)=>{
        if(nr>=0 && nr<8 && nc>=0 && nc<8 && (!board[nr][nc] || enemy(board[nr][nc]))) moves.push({row:nr,col:nc});
    }

    switch(piece[1]){
        case 'P': // Pawn
            if(!board[r+dir][c]) moves.push({row:r+dir,col:c});
            if((r===6 && isWhite(piece)) || (r===1 && isBlack(piece))) if(!board[r+2*dir][c]) moves.push({row:r+2*dir,col:c});
            if(c>0 && enemy(board[r+dir][c-1])) moves.push({row:r+dir,col:c-1});
            if(c<7 && enemy(board[r+dir][c+1])) moves.push({row:r+dir,col:c+1});
            if(enPassantTarget && enPassantTarget.row===r+dir && Math.abs(enPassantTarget.col-c)===1) moves.push({...enPassantTarget});
            break;
        case 'R':
            moves = moves.concat(linearMoves(r,c,[[-1,0],[1,0],[0,-1],[0,1]]));
            break;
        case 'N':
            [[-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2]].forEach(([dr,dc])=>addMove(r+dr,c+dc));
            break;
        case 'B':
            moves = moves.concat(linearMoves(r,c,[[-1,-1],[-1,1],[1,-1],[1,1]]));
            break;
        case 'Q':
            moves = moves.concat(linearMoves(r,c,[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]));
            break;
        case 'K':
            for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
                if(dr===0 && dc===0) continue;
                const nr=r+dr,nc=c+dc;
                if(nr>=0 && nr<8 && nc>=0 && nc<8 && (!board[nr][nc] || enemy(board[nr][nc]))) moves.push({row:nr,col:nc});
            }
            // Castling
            if(!kingMoved[piece] && !inCheck(turn)){
                if(!board[r][c+1]&&!board[r][c+2]&&!rookMoved[turn+'H']) moves.push({row:r,col:c+2,castle:true});
                if(!board[r][c-1]&&!board[r][c-2]&&!board[r][c-3]&&!rookMoved[turn+'A']) moves.push({row:r,col:c-2,castle:true});
            }
            break;
    }

    moves = moves.filter(m=>!wouldBeInCheck(r,c,m.row,m.col));
    return moves;
}

function linearMoves(r,c,directions){
    let moves=[];
    const enemy = isWhite(board[r][c])?isBlack:isWhite;
    directions.forEach(([dr,dc])=>{
        let nr=r+dr,nc=c+dc;
        while(nr>=0&&nr<8&&nc>=0&&nc<8){
            if(!board[nr][nc]) moves.push({row:nr,col:nc});
            else { if(enemy(board[nr][nc])) moves.push({row:nr,col:nc}); break; }
            nr+=dr; nc+=dc;
        }
    });
    return moves;
}

function movePiece(r1,c1,r2,c2){
    const piece=board[r1][c1];
    const move=legalMoves(r1,c1).find(m=>m.row===r2 && m.col===c2);
    if(move.castle){
        if(c2>c1){
            board[r1][c1+2]=piece; board[r1][c1]='';
            board[r1][c1+1]=board[r1][7]; board[r1][7]='';
        } else {
            board[r1][c1-2]=piece; board[r1][c1]='';
            board[r1][c1-1]=board[r1][0]; board[r1][0]='';
        }
        kingMoved[piece]=true; turn=turn==='white'?'black':'white'; return;
    }

    // En passant
    if(piece[1]==='P' && enPassantTarget && enPassantTarget.row===r2 && Math.abs(enPassantTarget.col-c2)===1){
        board[r1][c1]=''; board[r2][c2]=piece; board[r1][c2]=''; enPassantTarget=null; turn=turn==='white'?'black':'white'; return;
    }

    if(piece[1]==='P' && Math.abs(r2-r1)===2) enPassantTarget={row:(r1+r2)/2,col:c1};
    else enPassantTarget=null;
    if(piece[1]==='K') kingMoved[piece]=true;
    if(piece[1]==='R') rookMoved[turn+(c1===0?'A':'H')]=true;

    board[r2][c2]=piece; board[r1][c1]='';

    // Pawn promotion
    if(piece[1]==='P' && (r2===0 || r2===7)) board[r2][c2]=turn==='white'?'wQ':'bQ';

    turn=turn==='white'?'black':'white';
}

// Check detection
function inCheck(color){
    const king= color==='white'?'wK':'bK';
    let kingPos;
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(board[r][c]===king) kingPos={r,c};
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){
        const p=board[r][c];
        if(p && ((color==='white' && isBlack(p)) || (color==='black' && isWhite(p))))
            if(legalMoves(r,c).some(m=>m.row===kingPos.r && m.col===kingPos.c)) return true;
    }
    return false;
}

function wouldBeInCheck(r1,c1,r2,c2){
    const tmp = board.map(r=>[...r]);
    const piece = tmp[r1][c1];
    tmp[r2][c2]=piece; tmp[r1][c1]='';
    const oldBoard = board;
    board=tmp;
    const check=inCheck(turn);
    board=oldBoard;
    return check;
}

// Checkmate
function checkCheckmate(){
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){
        const p=board[r][c];
        if(p && ((turn==='white'&&isWhite(p))||(turn==='black'&&isBlack(p))))
            if(legalMoves(r,c).length>0) return false;
    }
    return inCheck(turn);
}

initBoard();
render();
