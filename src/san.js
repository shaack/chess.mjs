// SAN-related helpers extracted from Chess.js
// Depends on utils for rank/file/algebraic. Uses literal 'p' and 'k' to avoid circular deps.

import { rank, file, algebraic } from './utils.js'

export function get_disambiguator(move, moves) {
  const from = move.from
  const to = move.to
  const piece = move.piece

  let ambiguities = 0
  let same_rank = 0
  let same_file = 0

  for (let i = 0, len = moves.length; i < len; i++) {
    const ambig_from = moves[i].from
    const ambig_to = moves[i].to
    const ambig_piece = moves[i].piece

    if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
      ambiguities++
      if (rank(from) === rank(ambig_from)) same_rank++
      if (file(from) === file(ambig_from)) same_file++
    }
  }

  if (ambiguities > 0) {
    if (same_rank > 0 && same_file > 0) {
      return algebraic(from)
    } else if (same_file > 0) {
      return algebraic(from).charAt(1)
    } else {
      return algebraic(from).charAt(0)
    }
  }

  return ''
}

export function infer_piece_type(san) {
  let piece_type = san.charAt(0)
  if (piece_type >= 'a' && piece_type <= 'h') {
    const matches = san.match(/[a-h]\d.*[a-h]\d/)
    if (matches) {
      return undefined
    }
    return 'p' // PAWN
  }
  piece_type = piece_type.toLowerCase()
  if (piece_type === 'o') {
    return 'k' // KING
  }
  return piece_type
}

export function stripped_san(move) {
  return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '')
}
