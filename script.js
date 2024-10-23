const chessboard = document.getElementById('chessboard');

// Set up the initial positions for the board
const initialBoard = [
  ['bRoo', 'bKni', 'bBis', 'bQue', 'bKin', 'bBis', 'bKni', 'bRoo'],
  ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
  ['wRoo', 'wKni', 'wBis', 'wQue', 'wKin', 'wBis', 'wKni', 'wRoo'],
];

let currentPlayer = 'white'; // white starts first

function updateTurnDisplay() {
  const turnDisplay = document.getElementById('currentTurn');
  const currentPlayerText = currentPlayer === 'white' ? 'White' : 'Black';
  turnDisplay.textContent = `Current turn: ${currentPlayerText}`;
}

function renderBoard() {
  chessboard.innerHTML = '';
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');

      const piece = initialBoard[row][col];
      if (piece) {
        const pieceElement = document.createElement('div');
        pieceElement.textContent = piece.substring(1);
        pieceElement.classList.add('piece');
        pieceElement.classList.add(
          piece.startsWith('w') ? 'white-piece' : 'black-piece',
        );
        pieceElement.setAttribute('draggable', 'true');
        pieceElement.dataset.row = row;
        pieceElement.dataset.col = col;
        square.appendChild(pieceElement);
      }

      square.dataset.row = row;
      square.dataset.col = col;
      chessboard.appendChild(square);
    }
  }
}

let draggedPiece = null;

chessboard.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('piece')) {
    draggedPiece = e.target;

    // Check if it's the current player's turn
    const pieceColor = draggedPiece.classList.contains('white-piece')
      ? 'white'
      : 'black';
    if (pieceColor !== currentPlayer) {
      draggedPiece = null; // Prevent dragging if not the current player's turn
    }
  }
});

chessboard.addEventListener('dragover', (e) => {
  e.preventDefault(); // Allow dropping
});

chessboard.addEventListener('drop', (e) => {
  e.preventDefault();
  const targetSquare = e.target.closest('.square');
  if (targetSquare && draggedPiece) {
    const fromRow = parseInt(draggedPiece.dataset.row, 10);
    const fromCol = parseInt(draggedPiece.dataset.col, 10);
    const toRow = parseInt(targetSquare.dataset.row, 10);
    const toCol = parseInt(targetSquare.dataset.col, 10);

    // Validate the move based on the piece type
    const pieceType = initialBoard[fromRow][fromCol].substring(1);

    if (validateMove(pieceType, fromRow, fromCol, toRow, toCol)) {
      // Move the piece if the move is valid
      initialBoard[toRow][toCol] = initialBoard[fromRow][fromCol];
      initialBoard[fromRow][fromCol] = null;

      // Update the turn
      currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
      renderBoard();

      // Update the turn display
      updateTurnDisplay();
    }
  }
});

// Validate moves based on the piece type
function validateMove(pieceType, fromRow, fromCol, toRow, toCol) {
  const targetPiece = initialBoard[toRow][toCol];
  const targetColor = targetPiece
    ? (targetPiece.startsWith('w') ? 'white' : 'black')
    : null;

  // Prevent capturing your own piece
  if (targetColor === currentPlayer) {
    return false;
  }

  switch (pieceType) {
    case 'P':
      return validatePawnMove(fromRow, fromCol, toRow, toCol, targetPiece);
    case 'Roo':
      return validateRookMove(fromRow, fromCol, toRow, toCol);
    case 'Kni':
      return validateKnightMove(fromRow, fromCol, toRow, toCol);
    case 'Bis':
      return validateBishopMove(fromRow, fromCol, toRow, toCol);
    case 'Que':
      return validateQueenMove(fromRow, fromCol, toRow, toCol);
    case 'Kin':
      return validateKingMove(fromRow, fromCol, toRow, toCol);
    default:
      return false;
  }
}

function validatePawnMove(fromRow, fromCol, toRow, toCol, targetPiece) {
  // White moves up, black moves down
  const direction = initialBoard[fromRow][fromCol].startsWith('w') ? -1 : 1;
  const startRow = initialBoard[fromRow][fromCol].startsWith('w') ? 6 : 1;

  // Moving forward
  if (fromCol === toCol && !targetPiece) {
    if (toRow === fromRow + direction) {
      return true; // Move one square forward
    }
    if (
      toRow === fromRow + 2 * direction
      && fromRow === startRow
      && !initialBoard[fromRow + direction][fromCol]
    ) {
      return true; // Move two squares forward on the first move
    }
  }

  // Capturing diagonally
  if (
    Math.abs(fromCol - toCol) === 1
    && toRow === fromRow + direction
    && targetPiece
  ) {
    return true;
  }

  return false;
}

function validateRookMove(fromRow, fromCol, toRow, toCol) {
  // Rooks move in straight lines (horizontally or vertically)
  if (fromRow === toRow || fromCol === toCol) {
    return isPathClear(fromRow, fromCol, toRow, toCol);
  }
  return false;
}

function validateKnightMove(fromRow, fromCol, toRow, toCol) {
  // Knights move in an L shape (2 squares in one direction, 1 in the other)
  const rowDiff = Math.abs(fromRow - toRow);
  const colDiff = Math.abs(fromCol - toCol);
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
}

function validateBishopMove(fromRow, fromCol, toRow, toCol) {
  // Bishops move diagonally
  if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
    return isPathClear(fromRow, fromCol, toRow, toCol);
  }
  return false;
}

function validateQueenMove(fromRow, fromCol, toRow, toCol) {
  // Queens move like both rooks and bishops
  return (
    validateRookMove(fromRow, fromCol, toRow, toCol)
    || validateBishopMove(fromRow, fromCol, toRow, toCol)
  );
}

function validateKingMove(fromRow, fromCol, toRow, toCol) {
  // Kings move one square in any direction
  const rowDiff = Math.abs(fromRow - toRow);
  const colDiff = Math.abs(fromCol - toCol);
  return rowDiff <= 1 && colDiff <= 1;
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
  const rowStep = toRow > fromRow ? 1 : (toRow < fromRow ? -1 : 0);
  const colStep = toCol > fromCol ? 1 : (toCol < fromCol ? -1 : 0);

  let row = fromRow + rowStep;
  let col = fromCol + colStep;

  while (row !== toRow || col !== toCol) {
    if (initialBoard[row][col] !== null) {
      return false; // Path is blocked
    }
    row += rowStep;
    col += colStep;
  }
  return true;
}

// Initialize the board
renderBoard();
updateTurnDisplay();