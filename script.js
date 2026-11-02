const winMsg = document.querySelector("#winMsg");
const resultPopup = document.querySelector(".resultPopup");
const turn = document.querySelector("#turn");
const squares = document.querySelectorAll(".playSquare"); // returns a collection of element nodes, behave like an array but not a true array 

const initialBoard = ['', '', '', '', '', '', '', '', ''];

let board = [...initialBoard];

const winCombos = [ // Winning combinations
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]

let bestMoves;

let compTurn = Math.random() < 0.5 ? true : false; // Player is X and Computer is O.
turn.textContent = compTurn ? "Bot is Thinking..." : "Your Turn!";


// -----------------Human Play Logic-----------------------

if (compTurn) {
    setTimeout(() => {
        playComp();
    }, 1000);
}

squares.forEach((square, i) => {
    square.addEventListener("click", () => {
        if (!compTurn && board[i] === "") { // Player's turn
            square.textContent = "X";
            board[i] = "X";
            if (getWinner(board)) turn.textContent = "Game Over!";
            else turn.textContent = "Bot is Thinking...";
            compTurn = true;
            squares.forEach(s => {
                s.disabled = true;
            })
            setTimeout(() => {
                checkResult();
                playComp();
                squares.forEach(s => {
                    s.disabled = false;
                })
            }, 1000);
        }
    })
})


// ----------------Result Logic--------------------------------

function getWinner(board) { // Return "X", "O", "D" or null
    for (let [a, b, c] of winCombos) {
        if (board[a] !== "" && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (isDraw(board)) return "D";
    else return null;
}

function isDraw(board) { // Return true or false
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") return false;
    }
    return true;
}

function checkResult() { // Checks win or draw and shows suitable popup
    let winner = getWinner(board);
    if (winner) {
        displayPopup(winner);
    }
}

function displayPopup(winner) { // show suitable result based on 'winner'
    resultPopup.classList.remove("hidden");
    winMsg.textContent = `${winner !== "D" ? (winner === "X" ? "You Won!" : "Computer Won!") : "It's a Draw!"}`;
}

function hidePopup() {
    resultPopup.classList.add("hidden");
    squares.forEach(square => {
        square.textContent = "";
    })
    compTurn = Math.random() < 0.5 ? true : false;
    turn.textContent = compTurn ? "Bot is Thinking..." : "Your Turn!";
    board = [...initialBoard];
    if (compTurn) {
        setTimeout(() => {
            playComp();
        }, 1000);
    }
}

function playAgain() {
    hidePopup(); // Since playAgain() calls hidePopup(), I can simply write onclick="hidePopup()" in the playAgain button
}


// -----------------Computer Play Logic-----------------------------

function playForcingMove() {
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "O";
            if (getWinner(board) === "O") {
                board[i] = "";
                return i;
            }
            board[i] = "";
        }
    }

    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = "X";
            if (getWinner(board) === "X") {
                board[i] = "";
                return i;
            }
            board[i] = "";
        }
    }
}

function emptySquares(board) { // gives the array of indices of empty squares in board
    let empty = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") empty.push(i);
    }
    return empty;
}

function simpleBot() { // plays forcingMove if there is, else plays the random move 
    let forcingMove = playForcingMove();
    if (forcingMove != undefined) return forcingMove;
    else {
        let empty = emptySquares(board);
        return empty[Math.floor(Math.random() * empty.length)];
    }
}


//-----------------------------MiniMax Algorithm----------------------------------

function minimax(board, isComputerTurn, depth) {
    const result = getWinner(board);
    if (result === "O") return 10 - depth;   // computer wins (sooner is better)
    if (result === "X") return depth - 10;   // human wins (later is better)
    if (result === "D") return 0;            // draw

    if (isComputerTurn) {
        let best = -Infinity;
        for (const i of emptySquares(board)) {
            board[i] = "O";
            best = Math.max(best, minimax(board, false, depth + 1));
            board[i] = "";                   // undo
        }
        return best;
    } else {
        let best = Infinity;
        for (const i of emptySquares(board)) {
            board[i] = "X";
            best = Math.min(best, minimax(board, true, depth + 1));
            board[i] = "";                   // undo
        }
        return best;
    }
}

function bestMove() {
    let bestScore = -Infinity;
    bestMoves = [];                      // all squares tied for the best score

    for (const i of emptySquares(board)) {
        board[i] = "O";
        const score = minimax(board, false, 1);   // human moves next
        board[i] = "";                            // undo

        if (score > bestScore) {
            bestScore = score;
            bestMoves = [i];
        } else if (score === bestScore) {
            bestMoves.push(i);
        }
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

//----------------------------------------------------------------------------------------------


function playComp() {
    if (compTurn && !getWinner(board)) {
        let move = bestMove();
        board[move] = "O"
        document.querySelector(`#box${move}`).textContent = "O";
        if (getWinner(board)) {
            turn.textContent = "Game Over!";
            setTimeout(() => {
                checkResult();
            }, 1000);
        }
        else {
            turn.textContent = "Your Turn!";
            compTurn = false;
        }
    }
}