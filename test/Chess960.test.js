import { Chess } from '../src/Chess.js';

/**
 * Test suite for Chess960 (Fischer Random Chess) functionality in Chess.js
 */
describe('Chess960 Tests', () => {
  let chess;

  beforeEach(() => {
    // Create a new Chess instance before each test
    chess = new Chess();
  });

  test('Default chess960 mode should be false', () => {
    expect(chess.chess960()).toBe(false);
  });

  test('setChess960 should change the chess960 mode', () => {
    expect(chess.chess960()).toBe(false);
    chess.setChess960(true);
    expect(chess.chess960()).toBe(true);
    chess.setChess960(false);
    expect(chess.chess960()).toBe(false);
  });

  test('Constructor should accept chess960 mode parameter', () => {
    const chess960 = new Chess(undefined, true);
    expect(chess960.chess960()).toBe(true);
  });

  test('generateChess960Position should return a valid FEN string', () => {
    const fen = chess.generateChess960Position(518); // Standard position in Chess960
    expect(fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(chess.validate_fen(fen).valid).toBe(true);
  });

  test('generateChess960Position should generate different positions for different IDs', () => {
    const fen1 = chess.generateChess960Position(0);
    const fen2 = chess.generateChess960Position(1);
    expect(fen1).not.toBe(fen2);
    expect(chess.validate_fen(fen1).valid).toBe(true);
    expect(chess.validate_fen(fen2).valid).toBe(true);
  });

  test('generateChess960Position should generate the same position for the same ID', () => {
    const fen1 = chess.generateChess960Position(123);
    const fen2 = chess.generateChess960Position(123);
    expect(fen1).toBe(fen2);
  });

  test('resetChess960 should reset the board to a Chess960 position', () => {
    const initialFen = chess.fen();
    chess.resetChess960(0); // Use position 0 instead of 518 (standard position)
    const newFen = chess.fen();
    expect(chess.validate_fen(newFen).valid).toBe(true);
    expect(initialFen).not.toBe(newFen);
  });

  test('resetChess960 with no argument should generate a random position', () => {
    // Mock Math.random to return a predictable value
    const originalRandom = Math.random;
    Math.random = function() { return 0.5; };

    const initialFen = chess.fen();
    chess.resetChess960();
    const newFen = chess.fen();

    // Restore original Math.random
    Math.random = originalRandom;

    expect(initialFen).not.toBe(newFen);
    expect(chess.validate_fen(newFen).valid).toBe(true);
  });

  test('reset with chess960=true should reset to a random Chess960 position', () => {
    // Mock Math.random to return a predictable value
    const originalRandom = Math.random;
    Math.random = jest.fn().mockReturnValue(0.5);

    const initialFen = chess.fen();
    chess.reset(true);
    const newFen = chess.fen();

    // Restore original Math.random
    Math.random = originalRandom;

    expect(initialFen).not.toBe(newFen);
    expect(chess.validate_fen(newFen).valid).toBe(true);
  });

  test('reset with a position ID should reset to that specific Chess960 position', () => {
    const initialFen = chess.fen();
    chess.reset(0); // Use position 0 instead of 518 (standard position)
    const newFen = chess.fen();
    expect(chess.validate_fen(newFen).valid).toBe(true);
    expect(initialFen).not.toBe(newFen);
  });

  test('All generated Chess960 positions should be valid', () => {
    // Test a sample of positions
    const samplePositions = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 959];

    for (const positionId of samplePositions) {
      const fen = chess.generateChess960Position(positionId);
      expect(chess.validate_fen(fen).valid).toBe(true);

      // Check that the position follows Chess960 rules
      const position = fen.split(' ')[0].split('/')[7]; // Get the white pieces

      // Check that there are exactly 8 pieces
      expect(position.length).toBe(8);

      // Check that there are exactly 1 king, 1 queen, 2 rooks, 2 knights, and 2 bishops
      const pieces = {
        'K': 0, 'Q': 0, 'R': 0, 'N': 0, 'B': 0
      };

      for (const piece of position) {
        pieces[piece]++;
      }

      expect(pieces['K']).toBe(1);
      expect(pieces['Q']).toBe(1);
      expect(pieces['R']).toBe(2);
      expect(pieces['N']).toBe(2);
      expect(pieces['B']).toBe(2);

      // Check that the king is between the rooks
      const kingIndex = position.indexOf('K');
      const rookIndices = [];
      for (let i = 0; i < position.length; i++) {
        if (position[i] === 'R') {
          rookIndices.push(i);
        }
      }

      expect(rookIndices[0] < kingIndex && kingIndex < rookIndices[1]).toBe(true);

      // Check that bishops are on opposite colors
      const bishopIndices = [];
      for (let i = 0; i < position.length; i++) {
        if (position[i] === 'B') {
          bishopIndices.push(i);
        }
      }

      // Bishops are on opposite colors if the sum of their indices is odd
      expect((bishopIndices[0] + bishopIndices[1]) % 2).toBe(1);
    }
  });
});
