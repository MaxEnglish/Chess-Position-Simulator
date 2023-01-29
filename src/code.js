var board;
window.addEventListener('load', () => {
    board = new Board();
    board.setOpeningPosition();
    setDefaultPosition();
})

const onDrag = (target, pX, pY) => {
    target.style.position = 'absolute';
    target.style.zIndex = 1000;
    const initialParent = target.parentElement;
    
    document.body.append(target);

    moveAt(pX, pY, target)
    
    function onMouseMove(mouseMoveEvent) { moveAt(mouseMoveEvent.pageX, mouseMoveEvent.pageY, target) };
    
    document.addEventListener('mousemove', onMouseMove);
    
    target.onmouseup = function(mouseUpEvent) {
        target.style.position = 'static';

        const newParent = document.elementsFromPoint(mouseUpEvent.pageX, mouseUpEvent.pageY)[0];

        const formerX = parseInt(initialParent.id.charAt(0));
        const formerY = parseInt(initialParent.id.charAt(1));

        if (newParent.tagName === 'I') {
            const newX = parseInt(newParent.id.charAt(0));
            const newY = parseInt(newParent.id.charAt(1));

            if (board.checkIfValidMove(formerX, formerY, newX, newY)) {
                newParent.appendChild(target);
                board.handleMove(formerX, formerY, newX, newY);
            } else {
                initialParent.appendChild(target);
            }
        } else if (newParent.tagName === "IMG" && newParent.parentElement.id !== initialParent.id) {
            const newX = parseInt(newParent.parentElement.id.charAt(0));
            const newY = parseInt(newParent.parentElement.id.charAt(1));

            if (board.checkIfValidMove(formerX, formerY, newX, newY)) {
                newParent.parentElement.appendChild(target);
                newParent.remove();
                board.handleMove(formerX, formerY, newX, newY);
            } else {
                initialParent.appendChild(target);
            }
        } else {
            initialParent.appendChild(target);
        }

        document.removeEventListener('mousemove', onMouseMove);
        target.onmouseup = null;
    };
}

const moveAt = (pageX, pageY, target) => {
    target.style.left = pageX - target.offsetWidth / 2 + 'px';
    target.style.top = pageY - target.offsetHeight / 2 + 'px';
}

const createPiece = (x, y, piece) => {
    const color = piece.charAt(0);
    const pieceImage = document.createElement('img');
    pieceImage.src = piece + '.png';
    pieceImage.alt = piece;
    pieceImage.id = color;
    pieceImage.zIndex = 1000;
    pieceImage.addEventListener('mousedown', (e) => {
        onDrag(e.target, e.pageX, e.pageY);
        e.target.ondragstart = function() { return false};
    })
    document.getElementById(x + "" + y).appendChild(pieceImage);
}

const createPieces = (positions) => {
    positions.forEach(({x,y,piece}) => {
        createPiece(x,y,piece);
    })
}

const setDefaultPosition = () => {
    const positions = [{x: 0, y: 0, piece: "black_rook"}, {x: 0, y: 1, piece: "black_knight"}, {x: 0, y: 2, piece: "black_bishop"},
                       {x: 0, y: 3, piece: "black_queen"}, {x: 0, y: 4, piece: "black_king"}, {x: 0, y: 5, piece: "black_bishop"},
                       {x: 0, y: 6, piece: "black_knight"}, {x: 0, y: 7, piece: "black_rook"}, {x: 7, y: 0, piece: "white_rook"},
                       {x: 7, y: 1, piece: "white_knight"}, {x: 7, y: 2, piece: "white_bishop"}, {x: 7, y: 3, piece: "white_queen"},
                       {x: 7, y: 4, piece: "white_king"}, {x: 7, y: 5, piece: "white_bishop"},{x: 7, y: 6, piece: "white_knight"},
                       {x: 7, y: 7, piece: "white_rook"}];
    createPieces(positions);

    for (let i = 0; i < 8; ++i) {
        createPiece(1, i, "black_pawn")
        createPiece(6, i, "white_pawn");
  
    }
}


class Board {
    constructor () {
        //true = white, false = black
        this.turn = true;

        this.board = [];
    }

    changeTurn () {
        this.turn = !this.turn;
    }

    setOpeningPosition () {
        let color = 'b';
        for (let i = 0; i < 8; ++i) {
            this.board.push([]);
            if (i === 6) color = 'w';
            for (let j = 0; j < 8; ++j) {
                switch (i) {
                    case 0:
                    case 7:
                        this.board[i].push(this.determinePieceInRow(j, color));
                        break;
                    case 1:
                    case 6:
                        this.board[i].push(new Piece('pawn', color));
                        break;
                    default: 
                        this.board[i].push(null);                 
                }
            }
        }
        for (let k = 0; k < 8; ++k) {
            if (k < 2 || k > 5) {
                this.board[k].forEach((p, index) => {
                    this.setControllingAndXraying(k, index);
                })
            }
        } 
    }

    determinePieceInRow (j, color) {
        switch (j) {
            case 0:
            case 7:
                return new Piece('rook', color);
            case 1: 
            case 6:
                return new Piece('knight', color);
            case 2: 
            case 5:
                return new Piece('bishop', color);
            case 3:
                return new Piece('queen', color);
            case 4:
                return new Piece('king', color);
        }
    }

    checkIfValidMove (formerX, formerY, newX, newY) {
        const piece = this.getPieceAtPosition(formerX, formerY);
        const newCoordsStr = newX + '' + newY;

        if (piece.xrayingFlag) {
            return piece.xrayingFlag[1].has(newCoordsStr);
        }

        if (piece.type === 'king') {
            for (const row of this.board) {
                for (const square of row) {
                    if (square && square.color !== piece.color && square.controlling.has(newCoordsStr)) {
                        console.log(newCoordsStr)
                        console.log(square)

                        return false;
                    }
                }
            }
            return true;
        }

        if (piece.type === 'pawn') {
            if (piece.pawnMoves.has(newCoordsStr)) return true;
        } 

        const colorCheck = this.getPieceAtPosition(newX, newY);

        if (piece.type !== 'pawn' || colorCheck) {
            if (piece.controlling.has(newCoordsStr)) {
                if (colorCheck) {
                    return colorCheck.color !== piece.color;
                } else {
                    return true;
                }
            }
        }
        return false;
    }

    setControllingAndXraying (x, y) {
        const piece = this.getPieceAtPosition(x,y);
        piece.controlling.clear();

        switch(piece.type) {
            case 'pawn':
                piece.pawnMoves.clear();

                if (piece.color === 'b') {   //piece is black
                    if (x < 7) {
                        piece.controlling.add(x + 1 + '' + (y + 1));
                        piece.controlling.add(x + 1 + '' + (y - 1));

                        if (!this.getPieceAtPosition(x + 1, y)) {
                            if (x === 1 && !this.getPieceAtPosition(x + 2, y)) {
                                piece.pawnMoves.add(x + 2 + '' + y);
                            }
                            piece.pawnMoves.add(x + 1 + '' + y);
                        }
                    }
                } else {   //piece is white
                    if (x > 0) {
                        piece.controlling.add(x - 1 + '' + (y + 1));
                        piece.controlling.add(x - 1 + '' + (y - 1));
                        if (!this.getPieceAtPosition(x - 1, y)) {
                            if (x === 6 && !this.getPieceAtPosition(x - 2, y)) {
                                piece.pawnMoves.add(x - 2 + '' + y);
                            }
                            piece.pawnMoves.add(x - 1 + '' + y);
                        }
                    }
                }
                break;
            case 'knight':
                if (x + 2 < 8) {
                    if (y > 0) piece.controlling.add(x + 2 + '' + (y - 1));      
                    if (y < 7) piece.controlling.add(x + 2 + '' + (y + 1)); 
                }
                if (x - 2 >= 0) {
                    if (y > 0) piece.controlling.add(x - 2 + '' + (y - 1));      
                    if (y < 7) piece.controlling.add(x - 2 + '' + (y + 1)); 
                }
                if (y + 2 < 8) {
                    if (x > 0) piece.controlling.add(x - 1 + '' + (y + 2));      
                    if (x < 7) piece.controlling.add(x + 1 + '' + (y + 2)); 
                }
                if (y - 2 >= 0) {
                    if (x > 0) piece.controlling.add(x - 1 + '' + (y - 2));      
                    if (x < 7) piece.controlling.add(x + 1 + '' + (y - 2)); 
                }
                break;
            case 'bishop':
                piece.xraying.clear();

                let upRight = [x + 1, y + 1];
                let upLeft = [x + 1, y - 1];
                let downRight = [x - 1, y + 1];
                let downLeft = [x - 1, y - 1];

                let upRightToggle, upLeftToggle, downRightToggle, downLeftToggle;

                while (upRight || upLeft || downRight || downLeft) {
                    if (upRight) {
                        if (upRight[0] < 8 && upRight[1] < 8) {
                            if (upRightToggle) {
                                piece.xraying.add(upRight[0] + '' + upRight[1]);
                            } else {
                                piece.controlling.add(upRight[0] + '' + upRight[1]);
                                if (this.getPieceAtPosition(upRight[0], upRight[1])) {
                                    piece.xraying.add(upRight[0] + '' + upRight[1]);
                                    upRightToggle = true;
                                }
                            }
                            //upRight.forEach(val => ++val);
                            upRight = upRight.map(val => ++val);
                        } else {
                            upRight = null;
                        }
                    }
                    if (upLeft) {
                        if (upLeft[0] < 8 && upLeft[1] >= 0) {
                            if (upLeftToggle) {
                                piece.xraying.add(upLeft[0] + '' + upLeft[1]);
                            } else {
                                piece.controlling.add(upLeft[0] + '' + upLeft[1]);
                                if (this.getPieceAtPosition(upLeft[0], upLeft[1])) {
                                    piece.xraying.add(upLeft[0] + '' + upLeft[1]);
                                    upLeftToggle = true;
                                }
                            }
                            upLeft = [upLeft[0] + 1, upLeft[1] - 1];
                        } else {
                            upLeft = null;
                        }
                    }
                    if (downRight) {
                        if (downRight[0] >= 0 && downRight[1] < 8) {
                            if (downRightToggle) {
                                piece.xraying.add(downRight[0] + '' + downRight[1]);
                            } else {
                                piece.controlling.add(downRight[0] + '' + downRight[1]);
                                if (this.getPieceAtPosition(downRight[0], downRight[1])) {
                                    piece.xraying.add(downRight[0] + '' + downRight[1]);
                                    downRightToggle = true;
                                }
                            }
                            downRight = [downRight[0] - 1, downRight[1] + 1];
                        } else {
                            downRight = null;
                        }
                    }
                    if (downLeft) {
                        if (downLeft[0] >= 0 && downLeft[1] >= 0) {
                            if (downLeftToggle) {
                                piece.xraying.add(downLeft[0] + '' + downLeft[1]);
                            } else {
                                piece.controlling.add(downLeft[0] + '' + downLeft[1]);
                                if (this.getPieceAtPosition(downLeft[0], downLeft[1])) {
                                    piece.xraying.add(downLeft[0] + '' + downLeft[1]);
                                    downLeftToggle = true;
                                }
                            }
                            downLeft = downLeft.map(val => --val);
                        } else {
                            downLeft = null;
                        }
                    }
                }
                break;
            case 'rook':
                piece.xraying.clear();

                let up = [x + 1, y];
                let down = [x - 1, y];
                let right = [x, y + 1];
                let left = [x, y - 1];

                let toggleUp, toggleDown, toggleRight, toggleLeft;

                while (up || down || right || left) {
                    if (up) {
                        if (up[0] < 8) {
                            if (toggleUp) {
                                piece.xraying.add(up[0] + '' + up[1]);
                            } else {
                                piece.controlling.add(up[0] + '' + up[1]);
                                if (this.getPieceAtPosition(up[0], up[1])) {
                                    toggleUp = true;
                                }
                            }
                            up = [up[0] + 1, up[1]];
                        } else {
                            up = null;
                        }
                    }
                    if (down) {
                        if (down[0] >= 0) {
                            if (toggleDown) {
                                piece.xraying.add(down[0] + '' + down[1]);
                            } else {
                                piece.controlling.add(down[0] + '' + down[1]);
                                if (this.getPieceAtPosition(down[0], down[1])) {
                                    toggleDown = true;
                                }
                            }
                            down = [down[0] - 1, down[1]];
                        } else {
                            down = null;
                        }
                    }
                    if (right) {
                        if (right[1] < 8) {
                            if (toggleRight) {
                                piece.xraying.add(right[0] + '' + right[1]);
                            } else {
                                piece.controlling.add(right[0] + '' + right[1]);
                                if (this.getPieceAtPosition(right[0], right[1])) {
                                    toggleRight = true;
                                }
                            }
                            right = [right[0], right[1] + 1];
                        } else {
                            right = null;
                        }
                    }
                    if (left) {
                        if (left[1] >= 0) {
                            if (toggleLeft) {
                                piece.xraying.add(left[0] + '' + left[1]);
                            } else {
                                piece.controlling.add(left[0] + '' + left[1]);
                                if (this.getPieceAtPosition(left[0], left[1])) {
                                    toggleLeft = true;
                                }
                            }
                            left = [left[0], left[1] - 1];
                        } else {
                            left = null;
                        }
                    }
                }
                break;
            case 'queen':
                piece.xraying.clear();

                let upRightQ = [x + 1, y + 1];
                let upLeftQ = [x + 1, y - 1];
                let downRightQ = [x - 1, y + 1];
                let downLeftQ = [x - 1, y - 1];
                let upQ = [x + 1, y];
                let downQ = [x - 1, y];
                let rightQ = [x, y + 1];
                let leftQ = [x, y - 1];

                let upRightToggleQ, upLeftToggleQ, downRightToggleQ, downLeftToggleQ, toggleUpQ, toggleDownQ, toggleRightQ, toggleLeftQ;

                while (upRightQ || upLeftQ || downRightQ || downLeftQ || upQ || downQ || rightQ || leftQ) {
                    if (upRightQ) {
                        if (upRightQ[0] < 8 && upRightQ[1] < 8) {
                            if (upRightToggleQ) {
                                piece.xraying.add(upRightQ[0] + '' + upRightQ[1]);
                            } else {
                                piece.controlling.add(upRightQ[0] + '' + upRightQ[1]);
                                if (this.getPieceAtPosition(upRightQ[0], upRightQ[1])) {
                                    upRightToggleQ = true;
                                }
                            }
                            upRightQ = upRightQ.map(val => ++val);
                        } else {
                            upRightQ = null;
                        }
                    }
                    if (upLeftQ) {
                        if (upLeftQ[0] < 8 && upLeftQ[1] >= 0) {
                            if (upLeftToggleQ) {
                                piece.xraying.add(upLeftQ[0] + '' + upLeftQ[1]);
                            } else {
                                piece.controlling.add(upLeftQ[0] + '' + upLeftQ[1]);
                                if (this.getPieceAtPosition(upLeftQ[0], upLeftQ[1])) {
                                    upLeftToggleQ = true;
                                }
                            }
                            upLeftQ = [upLeftQ[0] + 1, upLeftQ[1] - 1];
                        } else {
                            upLeftQ = null;
                        }
                    }
                    if (downRightQ) {
                        if (downRightQ[0] >= 0 && downRightQ[1] < 8) {
                            if (downRightToggleQ) {
                                piece.xraying.add(downRightQ[0] + '' + downRightQ[1]);
                            } else {
                                piece.controlling.add(downRightQ[0] + '' + downRightQ[1]);
                                if (this.getPieceAtPosition(downRightQ[0], downRightQ[1])) {
                                    downRightToggleQ = true;
                                }
                            }
                            downRightQ = [downRightQ[0] - 1, downRightQ[1] + 1];
                        } else {
                            downRightQ = null;
                        }
                    }
                    if (downLeftQ) {
                        if (downLeftQ[0] >= 0 && downLeftQ[1] >= 0) {
                            if (downLeftToggleQ) {
                                piece.xraying.add(downLeftQ[0] + '' + downLeftQ[1]);
                            } else {
                                piece.controlling.add(downLeftQ[0] + '' + downLeftQ[1]);
                                if (this.getPieceAtPosition(downLeftQ[0], downLeftQ[1])) {
                                    downLeftToggleQ = true;
                                }
                            }
                            downLeftQ = downLeftQ.map(val => --val);
                        } else {
                            downLeftQ = null;
                        }
                    }
                    if (upQ) {
                        if (upQ[0] < 8) {
                            if (toggleUpQ) {
                                piece.xraying.add(upQ[0] + '' + upQ[1]);
                            } else {
                                piece.controlling.add(upQ[0] + '' + upQ[1]);
                                if (this.getPieceAtPosition(upQ[0], upQ[1])) {
                                    toggleUpQ = true;
                                }
                            }
                            upQ = [upQ[0] + 1, upQ[1]];
                        } else {
                            upQ = null;
                        }
                    }
                    if (downQ) {
                        if (downQ[0] >= 0) {
                            if (toggleDownQ) {
                                piece.xraying.add(downQ[0] + '' + downQ[1]);
                            } else {
                                piece.controlling.add(downQ[0] + '' + downQ[1]);
                                if (this.getPieceAtPosition(downQ[0], downQ[1])) {
                                    toggleDownQ = true;
                                }
                            }
                            downQ = [downQ[0] - 1, downQ[1]];
                        } else {
                            downQ = null;
                        }
                    }
                    if (rightQ) {
                        if (rightQ[1] < 8) {
                            if (toggleRightQ) {
                                piece.xraying.add(rightQ[0] + '' + rightQ[1]);
                            } else {
                                piece.controlling.add(rightQ[0] + '' + rightQ[1]);
                                if (this.getPieceAtPosition(rightQ[0], rightQ[1])) {
                                    toggleRightQ = true;
                                }
                            }
                            rightQ = [rightQ[0], rightQ[1] + 1];
                        } else {
                            rightQ = null;
                        }
                    }
                    if (leftQ) {
                        if (leftQ[1] >= 0) {
                            if (toggleLeftQ) {
                                piece.xraying.add(leftQ[0] + '' + leftQ[1]);
                            } else {
                                piece.controlling.add(leftQ[0] + '' + leftQ[1]);
                                if (this.getPieceAtPosition(leftQ[0], leftQ[1])) {
                                    toggleLeftQ = true;
                                }
                            }
                            leftQ = [leftQ[0], leftQ[1] - 1];
                        } else {
                            leftQ = null;
                        }
                    }
                }
                break;
            case 'king':
                if (x > 0) {piece.controlling.add(x - 1 + '' + y);}
                if (x < 7) piece.controlling.add(x + 1 + '' + y);
                if (y > 0) piece.controlling.add(x + '' + (y - 1));
                if (y < 7) piece.controlling.add(x + '' + (y + 1));
                if (x > 0 && y > 0) piece.controlling.add(x - 1 + '' + (y - 1));
                if (x > 0 && y < 7) piece.controlling.add(x - 1 + '' + (y + 1));
                if (y > 0 && x < 7) piece.controlling.add(x + 1 + '' + (y - 1));
                if (y < 7 && x < 7) piece.controlling.add(x + 1 + '' + (y + 1));
        }  

        if (piece.type === 'bishop' || piece.type === 'rook' || piece.type === 'queen') {
            const kingPos = this.getKingPosition(piece.color);
            
            if (piece.xraying.has(kingPos)) {
                this.needFlag(x, y, kingPos, piece.type); 
            } 
        }
        //console.log(piece)
    }

    needFlag (x, y, kingPosition, type) {
        const kingX = parseInt(kingPosition.charAt(0));
        const kingY = parseInt(kingPosition.charAt(1));
        let squareX = x;
        let squareY = y;
        let stop = false;
        let test;
        const movableSquares = new Set();
        movableSquares.add(squareX + '' + squareY);
        switch(type) {
            case 'queen':
            case 'bishop':
                if (kingX > squareX && kingY > squareY) {
                    while (true) {
                        ++squareX;
                        ++squareY;
                        if (!stop) {
                            test = this.getPieceAtPosition(squareX, squareY);
                            test ?
                            stop = true :
                            movableSquares.add(squareX + '' + squareY);
                        } else {
                            if (kingX === squareX && kingY === squareY) {
                                test.xrayingFlag = [[x,y],movableSquares];
                                return;
                            } else if (this.getPieceAtPosition(squareX, squareY)) {
                                return;
                            } else {
                                movableSquares.add(squareX + '' + squareY);
                            }
                        }
                    }
                } else if (kingX > squareX && kingY < squareY){
                    while (true) {
                        ++squareX;
                        --squareY;
                        if (!stop) {
                            test = this.getPieceAtPosition(squareX, squareY);
                            test ?
                            stop = true :
                            movableSquares.add(squareX + '' + squareY);
                        } else {
                            if (kingX === squareX && kingY === squareY) {
                                test.xrayingFlag = [[x,y],movableSquares];
                                return;
                            } else if (this.getPieceAtPosition(squareX, squareY)) {
                                return;
                            } else {
                                movableSquares.add(squareX + '' + squareY);
                            }
                        }
                    }
                } else if (kingX < squareX && kingY > squareY) {
                    while (true) {
                        --squareX;
                        ++squareY;
                        if (!stop) {
                            test = this.getPieceAtPosition(squareX, squareY);
                            test ?
                            stop = true :
                            movableSquares.add(squareX + '' + squareY);
                        } else {
                            if (kingX === squareX && kingY === squareY) {
                                test.xrayingFlag = [[x,y],movableSquares];
                                return;
                            } else if (this.getPieceAtPosition(squareX, squareY)) {
                                return;
                            } else {
                                movableSquares.add(squareX + '' + squareY);
                            }
                        }
                    }
                } else if (kingX < squareX && kingY < squareY) {
                    while (true) {
                        --squareX;
                        --squareY;
                        if (!stop) {
                            test = this.getPieceAtPosition(squareX, squareY);
                            test ?
                            stop = true :
                            movableSquares.add(squareX + '' + squareY);
                        } else {
                            if (kingX === squareX && kingY === squareY) {
                                test.xrayingFlag = [[x,y],movableSquares];
                                return;
                            } else if (this.getPieceAtPosition(squareX, squareY)) {
                                return;
                            } else {
                                movableSquares.add(squareX + '' + squareY);
                            }
                        }
                    }
                } 
            case 'rook':
                if (kingX === squareX && kingY > squareY) {
                    while (true) {
                        ++squareY;
                        if (!stop) {
                            test = this.getPieceAtPosition(squareX, squareY);
                            test ?
                            stop = true :
                            movableSquares.add(squareX + '' + squareY);
                        } else {
                            if (kingX === squareX && kingY === squareY) {
                                test.xrayingFlag = [[x,y],movableSquares];
                                return;
                            } else if (this.getPieceAtPosition(squareX, squareY)) {
                                return;
                            } else {
                                movableSquares.add(squareX + '' + squareY);
                            }
                        }
                    }
                } else if (kingX === squareX && kingY < squareY){
                    while (true) {
                        --squareY;
                        if (!stop) {
                            test = this.getPieceAtPosition(squareX, squareY);
                            test ?
                            stop = true :
                            movableSquares.add(squareX + '' + squareY);
                        } else {
                            if (kingX === squareX && kingY === squareY) {
                                test.xrayingFlag = [[x,y],movableSquares];
                                return;
                            } else if (this.getPieceAtPosition(squareX, squareY)) {
                                return;
                            } else {
                                movableSquares.add(squareX + '' + squareY);
                            }
                        }
                    }
                } else if (kingX < squareX && kingY === squareY) {
                    while (true) {
                        --squareX;
                        if (!stop) {
                            test = this.getPieceAtPosition(squareX, squareY);
                            test ?
                            stop = true :
                            movableSquares.add(squareX + '' + squareY);
                        } else {
                            if (kingX === squareX && kingY === squareY) {
                                test.xrayingFlag = [[x,y],movableSquares];
                                return;
                            } else if (this.getPieceAtPosition(squareX, squareY)) {
                                return;
                            } else {
                                movableSquares.add(squareX + '' + squareY);
                            }
                        }
                    }
                } else if (kingX > squareX && kingY === squareY) {
                    while (true) {
                        ++squareX;
                        if (!stop) {
                            test = this.getPieceAtPosition(squareX, squareY);
                            test ?
                            stop = true :
                            movableSquares.add(squareX + '' + squareY);
                        } else {
                            if (kingX === squareX && kingY === squareY) {
                                test.xrayingFlag = [[x,y],movableSquares];
                                return;
                            } else if (this.getPieceAtPosition(squareX, squareY)) {
                                return;
                            } else {
                                movableSquares.add(squareX + '' + squareY);
                            }
                        }
                    }
                }        
        }
    } 
    
    updateOtherPieces (formerX, formerY, newX, newY, update) {
        const formerStr = formerX + '' + formerY;
        const newStr = newX + '' + newY;
        update.forEach((updatee) => {
            if (updatee[0] !== newX && updatee[1] !== newY) {
                this.setControllingAndXraying(updatee[0],updatee[1]);
            }
        })
        this.board.forEach((row, rowIndex) => {
            row.forEach((square, squareIndex) => {
                if (square && ((square.controlling.has(formerStr) || square.controlling.has(newStr)) || (square.type === 'pawn' && (square.pawnMoves.has(formerStr) || square.pawnMoves.has(newStr))) || ((square.type === 'bishop' || square.type === 'rook' || square.type === 'queen') && (square.xraying.has(formerStr) || square.xraying.has(newStr))))) {
                    this.setControllingAndXraying(rowIndex, squareIndex);
                }
            })
        })
    }

    clearFlags () {
        const update = [];
        this.board.forEach((row) => {
            row.forEach((square) => {
                if (square && square.xrayingFlag) {
                    update.push(square.xrayingFlag[0]);
                    square.xrayingFlag = null;
                }
            })
        })
        return update;
    }

    handleMove (formerX, formerY, newX, newY) {
        this.changeTurn();
        const update = this.clearFlags();
        this.addPiece(newX, newY, board.removePiece(formerX, formerY));
        this.setControllingAndXraying(newX, newY);
        this.updateOtherPieces(newX, newY, formerX, formerY, update);
        console.log(this.board)
    }

    getKingPosition (color) {
        color === 'w' ? color = 'b' : color = 'w';
        let kingPosition;
            for (const [rowIndex, row] of this.board.entries()) {
                row.find((piece, pieceIndex) => {
                    if (piece && piece.type === 'king' && piece.color === color) {
                        kingPosition = rowIndex + '' + pieceIndex;
                    }
                })
                if (kingPosition) return kingPosition;
            }
    }

    getPieceAtPosition (x, y) {
        return this.board[x][y];
    }

    removePiece (x,y) {
        const piece = this.getPieceAtPosition(x,y);
        this.board[x][y] = null;
        return piece;
    }

    addPiece(x, y, piece) {
        this.board[x][y] = piece;
    }

}



class Piece {
    constructor (type, color) {
        this.type = type;
        this.color = color;
        //this.x = x;
        //this.y = y;
        this.controlling = new Set();
        if (type === 'bishop' || type === "rook" || type === 'queen') {
            this.xraying = new Set();
        };
        this.xrayingFlag = null;
        if (type === 'pawn') this.pawnMoves = new Set();
    }
}


//make xraying not a set. Only contain one coord
//check for xraying checkIfValidMove()

//for king moves, check if a piece of the opposite color controls the square trying to be moved to




//XRAY
//needs to be the next piece behind controlling
//needs to be updated