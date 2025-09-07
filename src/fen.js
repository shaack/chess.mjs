// FEN helpers extracted from Chess.js
// generate_fen is pure and takes current state as parameters to avoid circular deps.

import { algebraic } from './utils.js'

export function validate_fen(fen) {
  const errors = {
    0: 'No errors.',
    1: 'FEN string must contain six space-delimited fields.',
    2: '6th field (move number) must be a positive integer.',
    3: '5th field (half move counter) must be a non-negative integer.',
    4: '4th field (en-passant square) is invalid.',
    5: '3rd field (castling availability) is invalid.',
    6: '2nd field (side to move) is invalid.',
    7: "1st field (piece positions) does not contain 8 '/'-delimited rows.",
    8: '1st field (piece positions) is invalid [consecutive numbers].',
    9: '1st field (piece positions) is invalid [invalid piece].',
    10: '1st field (piece positions) is invalid [row too large].',
    11: 'Illegal en-passant square',
  }

  const tokens = fen.split(/\s+/)
  if (tokens.length !== 6) {
    return { valid: false, error_number: 1, error: errors[1] }
  }

  if (isNaN(parseInt(tokens[5])) || parseInt(tokens[5], 10) <= 0) {
    return { valid: false, error_number: 2, error: errors[2] }
  }

  if (isNaN(parseInt(tokens[4])) || parseInt(tokens[4], 10) < 0) {
    return { valid: false, error_number: 3, error: errors[3] }
  }

  if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
    return { valid: false, error_number: 4, error: errors[4] }
  }

  if (!/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
    return { valid: false, error_number: 5, error: errors[5] }
  }

  if (!/^(w|b)$/.test(tokens[1])) {
    return { valid: false, error_number: 6, error: errors[6] }
  }

  const rows = tokens[0].split('/')
  if (rows.length !== 8) {
    return { valid: false, error_number: 7, error: errors[7] }
  }

  for (let i = 0; i < rows.length; i++) {
    let sum_fields = 0
    let previous_was_number = false
    for (let k = 0; k < rows[i].length; k++) {
      if (!isNaN(rows[i][k])) {
        if (previous_was_number) {
          return { valid: false, error_number: 8, error: errors[8] }
        }
        sum_fields += parseInt(rows[i][k], 10)
        previous_was_number = true
      } else {
        if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
          return { valid: false, error_number: 9, error: errors[9] }
        }
        sum_fields += 1
        previous_was_number = false
      }
    }
    if (sum_fields !== 8) {
      return { valid: false, error_number: 10, error: errors[10] }
    }
  }

  if ((tokens[3][1] == '3' && tokens[1] == 'w') || (tokens[3][1] == '6' && tokens[1] == 'b')) {
    return { valid: false, error_number: 11, error: errors[11] }
  }

  return { valid: true, error_number: 0, error: errors[0] }
}

export function generate_fen(board, turn, castling, ep_square, half_moves, move_number, SQUARE_MAP, WHITE, BLACK, BITS) {
  let empty = 0
  let fen = ''

  for (let i = SQUARE_MAP.a8; i <= SQUARE_MAP.h1; i++) {
    if (board[i] == null) {
      empty++
    } else {
      if (empty > 0) {
        fen += empty
        empty = 0
      }
      const color = board[i].color
      const piece = board[i].type
      fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase()
    }

    if ((i + 1) & 0x88) {
      if (empty > 0) {
        fen += empty
      }
      if (i !== SQUARE_MAP.h1) {
        fen += '/'
      }
      empty = 0
      i += 8
    }
  }

  let cflags = ''
  if (castling[WHITE] & BITS.KSIDE_CASTLE) cflags += 'K'
  if (castling[WHITE] & BITS.QSIDE_CASTLE) cflags += 'Q'
  if (castling[BLACK] & BITS.KSIDE_CASTLE) cflags += 'k'
  if (castling[BLACK] & BITS.QSIDE_CASTLE) cflags += 'q'
  cflags = cflags || '-'

  const epflags = ep_square === -1 ? '-' : algebraic(ep_square)

  return [fen, turn, cflags, epflags, half_moves, move_number].join(' ')
}
