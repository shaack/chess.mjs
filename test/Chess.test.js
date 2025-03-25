import { Chess } from '../src/Chess.js';

/**
 * Test suite for normal chess functionality in Chess.js
 */
describe('Chess Tests', () => {
  let chess;

  beforeEach(() => {
    // Create a new Chess instance before each test
    chess = new Chess();
  });

  describe('Board Setup and FEN', () => {
    test('Default position should be the standard chess starting position', () => {
      const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      expect(chess.fen()).toBe(defaultFen);
    });

    test('load should correctly set up a position from FEN', () => {
      const testFen = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3';
      chess.load(testFen);
      expect(chess.fen()).toBe(testFen);
    });

    test('validate_fen should correctly validate FEN strings', () => {
      // Valid FEN
      const validFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      expect(chess.validate_fen(validFen).valid).toBe(true);

      // Invalid FEN - wrong number of fields
      const invalidFen1 = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -';
      expect(chess.validate_fen(invalidFen1).valid).toBe(false);
    });

    test('reset should reset the board to the starting position', () => {
      const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

      // Change the position
      chess.load('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3');

      // Reset
      chess.reset();

      // Check that it's back to the default position
      expect(chess.fen()).toBe(defaultFen);
    });
  });

  describe('Move Generation and Validation', () => {
    test('moves should generate all legal moves from the starting position', () => {
      const moves = chess.moves();

      // There should be 20 legal moves from the starting position
      expect(moves.length).toBe(20);

      // Check for some specific moves
      expect(moves).toContain('a3');
      expect(moves).toContain('a4');
      expect(moves).toContain('Nc3');
      expect(moves).toContain('Nf3');
    });

    test('moves with verbose option should return detailed move objects', () => {
      const moves = chess.moves({ verbose: true });

      // There should be 20 legal moves from the starting position
      expect(moves.length).toBe(20);

      // Check a specific move
      const e4Move = moves.find(move => move.to === 'e4');
      expect(e4Move).toBeDefined();
      expect(e4Move.from).toBe('e2');
      expect(e4Move.piece).toBe('p');
      expect(e4Move.color).toBe('w');
    });
  });

  describe('Making and Undoing Moves', () => {
    test('move should correctly make a move using SAN notation', () => {
      // Make a move
      expect(chess.move('e4')).toBeTruthy();

      // Check the new position
      expect(chess.fen()).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');

      // Make another move
      expect(chess.move('e5')).toBeTruthy();

      // Check the new position
      expect(chess.fen()).toBe('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2');
    });

    test('move should correctly make a move using a move object', () => {
      // Make a move using an object
      expect(chess.move({ from: 'e2', to: 'e4' })).toBeTruthy();

      // Check the new position
      expect(chess.fen()).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
    });

    test('undo_move should correctly undo the last move', () => {
      const initialFen = chess.fen();

      // Make a move
      chess.move('e4');

      // Undo the move
      chess.undo();

      // Check that we're back to the initial position
      expect(chess.fen()).toBe(initialFen);
    });
  });

  describe('Game State Detection', () => {
    test('in_check should correctly detect check', () => {
      // Initial position - not in check
      expect(chess.in_check()).toBe(false);

      // Set up a position where white is in check
      chess.load('rnb1kbnr/pppp2pp/8/4pp2/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1');
      chess.move('Qh5'); // Move white queen to h5, putting black king in check
      expect(chess.in_check()).toBe(true);
    });

    test('in_checkmate should correctly detect checkmate', () => {
      // Initial position - not in checkmate
      expect(chess.in_checkmate()).toBe(false);

      // Set up a checkmate position (Fool's mate)
      chess.load('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
      expect(chess.in_checkmate()).toBe(true);
    });

    test('in_stalemate should correctly detect stalemate', () => {
      // Initial position - not in stalemate
      expect(chess.in_stalemate()).toBe(false);

      // Set up a stalemate position
      chess.load('4k3/4P3/4K3/8/8/8/8/8 b - - 0 1');
      expect(chess.in_stalemate()).toBe(true);
    });

    test('insufficient_material should correctly detect insufficient material', () => {
      // Initial position - sufficient material
      expect(chess.insufficient_material()).toBe(false);

      // K vs K - insufficient material
      chess.load('4k3/8/4K3/8/8/8/8/8 w - - 0 1');
      expect(chess.insufficient_material()).toBe(true);
    });

    test('game_over should correctly detect when the game is over', () => {
      // Initial position - game not over
      expect(chess.game_over()).toBe(false);

      // Checkmate - game over
      chess.load('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');
      expect(chess.game_over()).toBe(true);
    });
  });

  describe('Special Moves', () => {
    test('castling should work correctly', () => {
      // Set up a position where castling is possible
      chess.load('r3k2r/pppqbppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPPQBPPP/R3K2R w KQkq - 6 8');

      // Kingside castling
      expect(chess.move('O-O')).toBeTruthy();
      expect(chess.fen()).toBe('r3k2r/pppqbppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPPQBPPP/R4RK1 b kq - 7 8');
    });
  });
});
