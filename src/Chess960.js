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

    static detectStartPosition(fen) {
        const ranks = fen.split('/')
        // Extract the white first rank from the FEN
        const whiteRank = ranks[7].split(' ')[0]
        if (whiteRank.length !== 8) {
            throw new Error(`Invalid FEN for Chess960 detection: ${fen}`)
        }
        // Validate black back rank mirrors white back rank
        const blackRank = ranks[0]
        if (blackRank !== whiteRank.toLowerCase()) {
            throw new Error(`Invalid Chess960 start position: black pieces don't mirror white pieces`)
        }
        // Validate pawn ranks
        if (ranks[6] !== 'PPPPPPPP') {
            throw new Error(`Invalid Chess960 start position: white pawns not on second rank`)
        }
        if (ranks[1] !== 'pppppppp') {
            throw new Error(`Invalid Chess960 start position: black pawns not on seventh rank`)
        }
        const position = whiteRank.split('')

        // Step 1: Find bishops
        let lightSquareBishop = -1
        let darkSquareBishop = -1
        for (let i = 0; i < 8; i++) {
            if (position[i] === 'B') {
                if (i % 2 === 1) {
                    lightSquareBishop = (i - 1) / 2
                } else {
                    darkSquareBishop = i / 2
                }
            }
        }
        if (lightSquareBishop === -1 || darkSquareBishop === -1) {
            throw new Error(`Invalid Chess960 position: bishops not found on expected squares`)
        }

        // Step 2: Find queen position among non-bishop squares
        let emptySquares = []
        for (let i = 0; i < 8; i++) {
            if (position[i] !== 'B') {
                emptySquares.push(i)
            }
        }
        let queenPosition = -1
        for (let i = 0; i < emptySquares.length; i++) {
            if (position[emptySquares[i]] === 'Q') {
                queenPosition = i
                break
            }
        }
        if (queenPosition === -1) {
            throw new Error(`Invalid Chess960 position: queen not found`)
        }

        // Step 3: Find knight pattern among remaining squares (after removing bishops and queen)
        const knightPatterns = [
            [0, 1], [0, 2], [0, 3], [0, 4],
            [1, 2], [1, 3], [1, 4],
            [2, 3], [2, 4],
            [3, 4]
        ]
        emptySquares = []
        for (let i = 0; i < 8; i++) {
            if (position[i] !== 'B' && position[i] !== 'Q') {
                emptySquares.push(i)
            }
        }
        let knightIndices = []
        for (let i = 0; i < emptySquares.length; i++) {
            if (position[emptySquares[i]] === 'N') {
                knightIndices.push(i)
            }
        }
        let knightPatternIndex = -1
        for (let i = 0; i < knightPatterns.length; i++) {
            if (knightPatterns[i][0] === knightIndices[0] && knightPatterns[i][1] === knightIndices[1]) {
                knightPatternIndex = i
                break
            }
        }
        if (knightPatternIndex === -1) {
            throw new Error(`Invalid Chess960 position: knight pattern not found`)
        }

        // Reconstruct the ID: id = lightSquareBishop + 4 * darkSquareBishop + 16 * queenPosition + 96 * knightPatternIndex
        return lightSquareBishop + 4 * darkSquareBishop + 16 * queenPosition + 96 * knightPatternIndex
    }

}