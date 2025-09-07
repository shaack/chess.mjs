/**
 * Author: Stefan Haack (https://shaack.com)
 */
export class Chess960 {
    static generateStartPosition(id) {
        // Validate input
        if (id === undefined || id === null) {
            id = Math.floor(Math.random() * 960); // Random position if no ID provided
        } else if (typeof id !== 'number' || id < 0 || id > 959) {
            throw new Error(`Invalid Chess960 ID: ${id}. Must be between 0 and 959.`);
        }

        // Initialize empty position array for white pieces
        const position = new Array(8).fill(null);

        // Step 1: Place bishops on opposite color squares
        // First bishop on light squares (1, 3, 5, 7)
        let n = id;
        let lightSquareBishop = n % 4;
        n = Math.floor(n / 4);
        position[2 * lightSquareBishop + 1] = 'B';

        // Second bishop on dark squares (0, 2, 4, 6)
        let darkSquareBishop = n % 4;
        n = Math.floor(n / 4);
        position[2 * darkSquareBishop] = 'B';

        // Step 2: Place queen on remaining empty squares
        let queenPosition = n % 6;
        n = Math.floor(n / 6);

        // Find the queenPosition-th empty square
        let emptySquares = [];
        for (let i = 0; i < 8; i++) {
            if (position[i] === null) {
                emptySquares.push(i);
            }
        }
        position[emptySquares[queenPosition]] = 'Q';

        // Step 3: Place knights on remaining empty squares
        // There are 10 possible knight arrangements for 5 remaining squares
        const knightPatterns = [
            [0, 1], [0, 2], [0, 3], [0, 4],
            [1, 2], [1, 3], [1, 4],
            [2, 3], [2, 4],
            [3, 4]
        ];

        let knightPattern = knightPatterns[n];

        // Find remaining empty squares
        emptySquares = [];
        for (let i = 0; i < 8; i++) {
            if (position[i] === null) {
                emptySquares.push(i);
            }
        }

        // Place knights at the pattern positions
        position[emptySquares[knightPattern[0]]] = 'N';
        position[emptySquares[knightPattern[1]]] = 'N';

        // Step 4: Place remaining pieces (King between two Rooks)
        // Find the last 3 empty squares and place R-K-R
        emptySquares = [];
        for (let i = 0; i < 8; i++) {
            if (position[i] === null) {
                emptySquares.push(i);
            }
        }

        // The remaining 3 squares must be filled with R-K-R in that order
        position[emptySquares[0]] = 'R';
        position[emptySquares[1]] = 'K';
        position[emptySquares[2]] = 'R';

        // Convert to FEN notation
        const whiteRank = position.join('');
        const blackRank = whiteRank.toLowerCase();

        // Use traditional castling rights format (KQkq) instead of X-FEN format
        const castlingRights = 'KQkq';

        // Build complete FEN string
        return `${blackRank}/pppppppp/8/8/8/8/PPPPPPPP/${whiteRank} w ${castlingRights} - 0 1`;
    }

}