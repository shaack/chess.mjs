/*
 * Copyright (c) 2022, Jeff Hlywa (jhlywa@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *----------------------------------------------------------------------------*/

import { rank, file, algebraic, swap_color, is_digit, clone, trim } from './utils.js'
import { get_disambiguator, infer_piece_type, stripped_san } from './san.js'
import { validate_fen as validateFEN, generate_fen as generateFEN } from './fen.js'
import { SYMBOLS, DEFAULT_POSITION, TERMINATION_MARKERS, PAWN_OFFSETS, PIECE_OFFSETS, ATTACKS, RAYS, SHIFTS, BITS, RANK_1, RANK_2, RANK_3, RANK_4, RANK_5, RANK_6, RANK_7, RANK_8, FLAGS } from './constants.js'
import { SQUARE_MAP } from './squares.js'
export { SQUARES } from './squares.js'
export { FLAGS } from './constants.js'











const ROOKS = {
    w: [
        { square: SQUARE_MAP.a1, flag: BITS.QSIDE_CASTLE },
        { square: SQUARE_MAP.h1, flag: BITS.KSIDE_CASTLE },
    ],
    b: [
        { square: SQUARE_MAP.a8, flag: BITS.QSIDE_CASTLE },
        { square: SQUARE_MAP.h8, flag: BITS.KSIDE_CASTLE },
    ],
}

const PARSER_STRICT = 0
const PARSER_SLOPPY = 1

/* this function is used to uniquely identify ambiguous moves */



/*****************************************************************************
 * UTILITY FUNCTIONS
 ****************************************************************************/
// moved to ./utils.js

/***************************************************************************
 * PUBLIC CONSTANTS
 **************************************************************************/

export const BLACK = 'b'
export const WHITE = 'w'

export const EMPTY = -1

export const PAWN = 'p'
export const KNIGHT = 'n'
export const BISHOP = 'b'
export const ROOK = 'r'
export const QUEEN = 'q'
export const KING = 'k'



export const Chess = function (fen, options) {
    var board = new Array(128)
    var kings = { w: EMPTY, b: EMPTY }
    var turn = WHITE
    var castling = { w: 0, b: 0 }
    var ep_square = EMPTY
    var half_moves = 0
    var move_number = 1
    var history = []
    var header = {}
    var comments = {}

    var isChess960 = !!(options && options.chess960)

    /* if the user passes in a fen string, load it, else default to
     * starting position
     */
    if (typeof fen === 'undefined' || typeof fen === 'object') {
        // allow calling new Chess({chess960:true})
        if (typeof fen === 'object' && !options) {
            options = fen
            isChess960 = !!(options && options.chess960)
        }
        load(DEFAULT_POSITION)
    } else {
        load(fen)
    }

    function clear(keep_headers) {
        if (typeof keep_headers === 'undefined') {
            keep_headers = false
        }

        board = new Array(128)
        kings = { w: EMPTY, b: EMPTY }
        turn = WHITE
        castling = { w: 0, b: 0 }
        ep_square = EMPTY
        half_moves = 0
        move_number = 1
        history = []
        if (!keep_headers) header = {}
        comments = {}
        update_setup(generate_fen())
    }

    function prune_comments() {
        var reversed_history = []
        var current_comments = {}
        var copy_comment = function (fen) {
            if (fen in comments) {
                current_comments[fen] = comments[fen]
            }
        }
        while (history.length > 0) {
            reversed_history.push(undo_move())
        }
        copy_comment(generate_fen())
        while (reversed_history.length > 0) {
            make_move(reversed_history.pop())
            copy_comment(generate_fen())
        }
        comments = current_comments
    }

    function reset() {
        load(DEFAULT_POSITION)
    }

    function load(fen, keep_headers) {
        if (typeof keep_headers === 'undefined') {
            keep_headers = false
        }

        var tokens = fen.split(/\s+/)
        var position = tokens[0]
        var square = 0

        if (!validate_fen(fen).valid) {
            return false
        }

        clear(keep_headers)

        for (var i = 0; i < position.length; i++) {
            var piece = position.charAt(i)

            if (piece === '/') {
                square += 8
            } else if (is_digit(piece)) {
                square += parseInt(piece, 10)
            } else {
                var color = piece < 'a' ? WHITE : BLACK
                put({ type: piece.toLowerCase(), color: color }, algebraic(square))
                square++
            }
        }

        turn = tokens[1]

        if (tokens[2].indexOf('K') > -1) {
            castling.w |= BITS.KSIDE_CASTLE
        }
        if (tokens[2].indexOf('Q') > -1) {
            castling.w |= BITS.QSIDE_CASTLE
        }
        if (tokens[2].indexOf('k') > -1) {
            castling.b |= BITS.KSIDE_CASTLE
        }
        if (tokens[2].indexOf('q') > -1) {
            castling.b |= BITS.QSIDE_CASTLE
        }

        ep_square = tokens[3] === '-' ? EMPTY : SQUARE_MAP[tokens[3]]
        half_moves = parseInt(tokens[4], 10)
        move_number = parseInt(tokens[5], 10)

        init_chess960_rooks_if_needed()
        update_setup(generate_fen())

        return true
    }

    /* TODO: this function is pretty much crap - it validates structure but
     * completely ignores content (e.g. doesn't verify that each side has a king)
     * ... we should rewrite this, and ditch the silly error_number field while
     * we're at it
     */
    function validate_fen(fen) {
        return validateFEN(fen)
    }

    function generate_fen() {
        return generateFEN(
            board,
            turn,
            castling,
            ep_square,
            half_moves,
            move_number,
            SQUARE_MAP,
            WHITE,
            BLACK,
            BITS
        )
    }

    function set_header(args) {
        for (var i = 0; i < args.length; i += 2) {
            if (typeof args[i] === 'string' && typeof args[i + 1] === 'string') {
                header[args[i]] = args[i + 1]
            }
        }
        return header
    }

    /* called when the initial board setup is changed with put() or remove().
     * modifies the SetUp and FEN properties of the header object.  if the FEN is
     * equal to the default position, the SetUp and FEN are deleted
     * the setup is only updated if history.length is zero, ie moves haven't been
     * made.
     */
    function update_setup(fen) {
        if (history.length > 0) return

        if (fen !== DEFAULT_POSITION) {
            header['SetUp'] = '1'
            header['FEN'] = fen
        } else {
            delete header['SetUp']
            delete header['FEN']
        }
    }

    function get(square) {
        var piece = board[SQUARE_MAP[square]]
        return piece ? { type: piece.type, color: piece.color } : null
    }

    function put(piece, square) {
        /* check for valid piece object */
        if (!('type' in piece && 'color' in piece)) {
            return false
        }

        /* check for piece */
        if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
            return false
        }

        /* check for valid square */
        if (!(square in SQUARE_MAP)) {
            return false
        }

        var sq = SQUARE_MAP[square]

        /* don't let the user place more than one king */
        if (
            piece.type == KING &&
            !(kings[piece.color] == EMPTY || kings[piece.color] == sq)
        ) {
            return false
        }

        board[sq] = { type: piece.type, color: piece.color }
        if (piece.type === KING) {
            kings[piece.color] = sq
        }

        update_setup(generate_fen())

        return true
    }

    function remove(square) {
        var piece = get(square)
        board[SQUARE_MAP[square]] = null
        if (piece && piece.type === KING) {
            kings[piece.color] = EMPTY
        }

        update_setup(generate_fen())

        return piece
    }

    function init_chess960_rooks_if_needed() {
        if (!isChess960) return
        function set_for(color) {
            // find king and rooks on back rank
            var ksq = kings[color]
            if (ksq === EMPTY) return
            var rk = rank(ksq)
            var left_rook = null
            var right_rook = null
            for (var f = 0; f < 8; f++) {
                var sq = (rk << 4) + f
                var p = board[sq]
                if (p && p.type === ROOK && p.color === color) {
                    if (f < file(ksq)) {
                        left_rook = sq
                    } else if (f > file(ksq) && right_rook === null) {
                        right_rook = sq
                    }
                }
            }
            if (left_rook != null) {
                ROOKS[color][0].square = left_rook // QSIDE
            }
            if (right_rook != null) {
                ROOKS[color][1].square = right_rook // KSIDE
            }
        }
        set_for(WHITE)
        set_for(BLACK)
    }

    function build_move(board, from, to, flags, promotion) {
        var move = {
            color: turn,
            from: from,
            to: to,
            flags: flags,
            piece: board[from].type,
        }

        if (promotion) {
            move.flags |= BITS.PROMOTION
            move.promotion = promotion
        }

        if (board[to]) {
            move.captured = board[to].type
        } else if (flags & BITS.EP_CAPTURE) {
            move.captured = PAWN
        }
        return move
    }

    function generate_moves(options) {
        function add_move(board, moves, from, to, flags) {
            /* if pawn promotion */
            if (
                board[from].type === PAWN &&
                (rank(to) === RANK_8 || rank(to) === RANK_1)
            ) {
                var pieces = [QUEEN, ROOK, BISHOP, KNIGHT]
                for (var i = 0, len = pieces.length; i < len; i++) {
                    moves.push(build_move(board, from, to, flags, pieces[i]))
                }
            } else {
                moves.push(build_move(board, from, to, flags))
            }
        }

        var moves = []
        var us = turn
        var them = swap_color(us)
        var second_rank = { b: RANK_7, w: RANK_2 }

        var first_sq = SQUARE_MAP.a8
        var last_sq = SQUARE_MAP.h1
        var single_square = false

        /* do we want legal moves? */
        var legal =
            typeof options !== 'undefined' && 'legal' in options
                ? options.legal
                : true

        var piece_type =
            typeof options !== 'undefined' &&
            'piece' in options &&
            typeof options.piece === 'string'
                ? options.piece.toLowerCase()
                : true

        /* are we generating moves for a single square? */
        if (typeof options !== 'undefined' && 'square' in options) {
            if (options.square in SQUARE_MAP) {
                first_sq = last_sq = SQUARE_MAP[options.square]
                single_square = true
            } else {
                /* invalid square */
                return []
            }
        }

        for (var i = first_sq; i <= last_sq; i++) {
            /* did we run off the end of the board */
            if (i & 0x88) {
                i += 7
                continue
            }

            var piece = board[i]
            if (piece == null || piece.color !== us) {
                continue
            }

            if (piece.type === PAWN && (piece_type === true || piece_type === PAWN)) {
                /* single square, non-capturing */
                var square = i + PAWN_OFFSETS[us][0]
                if (board[square] == null) {
                    add_move(board, moves, i, square, BITS.NORMAL)

                    /* double square */
                    var square = i + PAWN_OFFSETS[us][1]
                    if (second_rank[us] === rank(i) && board[square] == null) {
                        add_move(board, moves, i, square, BITS.BIG_PAWN)
                    }
                }

                /* pawn captures */
                for (j = 2; j < 4; j++) {
                    var square = i + PAWN_OFFSETS[us][j]
                    if (square & 0x88) continue

                    if (board[square] != null && board[square].color === them) {
                        add_move(board, moves, i, square, BITS.CAPTURE)
                    } else if (square === ep_square) {
                        add_move(board, moves, i, ep_square, BITS.EP_CAPTURE)
                    }
                }
            } else if (piece_type === true || piece_type === piece.type) {
                for (var j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
                    var offset = PIECE_OFFSETS[piece.type][j]
                    var square = i

                    while (true) {
                        square += offset
                        if (square & 0x88) break

                        if (board[square] == null) {
                            add_move(board, moves, i, square, BITS.NORMAL)
                        } else {
                            if (board[square].color === us) break
                            add_move(board, moves, i, square, BITS.CAPTURE)
                            break
                        }

                        /* break, if knight or king */
                        if (piece.type === 'n' || piece.type === 'k') break
                    }
                }
            }
        }

        /* check for castling if: a) we're generating all moves, or b) we're doing
         * single square move generation on the king's square
         */
        if (piece_type === true || piece_type === KING) {
            if (!single_square || last_sq === kings[us]) {
                if (isChess960) {
                    var kFrom = kings[us]
                    var rankFrom = rank(kFrom)
                    var kside = castling[us] & BITS.KSIDE_CASTLE
                    var qside = castling[us] & BITS.QSIDE_CASTLE

                    function path_clear_for_king(to, rookFrom) {
                        if (to === kFrom) return true // rook-move-only castling: king doesn't move
                        var step = file(to) > file(kFrom) ? 1 : -1
                        for (var f = file(kFrom) + step; f != file(to) + step; f += step) {
                            var sq = (rankFrom << 4) + f
                            if (sq === rookFrom) continue
                            if (sq !== kFrom && board[sq] != null) return false
                        }
                        return true
                    }
                    function king_path_safe(to) {
                        // king cannot castle out of, through, or into check
                        if (to === kFrom) {
                            return !attacked(them, kFrom)
                        }
                        var step = file(to) > file(kFrom) ? 1 : -1
                        if (attacked(them, kFrom)) return false
                        for (var f = file(kFrom) + step; f != file(to) + step; f += step) {
                            var sq = (rankFrom << 4) + f
                            if (attacked(them, sq)) return false
                        }
                        return true
                    }
                    function path_clear_for_rook(rookFrom, rookTo) {
                        var step = file(rookTo) > file(rookFrom) ? 1 : -1
                        for (var f = file(rookFrom) + step; f != file(rookTo) + step; f += step) {
                            var sq = (rankFrom << 4) + f
                            if (sq === kFrom) continue
                            if (board[sq] != null) return false
                        }
                        return true
                    }

                    if (kside) {
                        var kTo = (rankFrom === RANK_1 ? SQUARE_MAP.g1 : SQUARE_MAP.g8)
                        var rookFrom = ROOKS[us][1].square
                        var rookTo = (rankFrom === RANK_1 ? SQUARE_MAP.f1 : SQUARE_MAP.f8)
                        if (
                            rookFrom != null &&
                            path_clear_for_king(kTo, rookFrom) &&
                            path_clear_for_rook(rookFrom, rookTo) &&
                            king_path_safe(kTo)
                        ) {
                            add_move(board, moves, kFrom, kTo, BITS.KSIDE_CASTLE)
                        }
                    }

                    if (qside) {
                        var kToQ = (rankFrom === RANK_1 ? SQUARE_MAP.c1 : SQUARE_MAP.c8)
                        var rookFromQ = ROOKS[us][0].square
                        var rookToQ = (rankFrom === RANK_1 ? SQUARE_MAP.d1 : SQUARE_MAP.d8)
                        if (
                            rookFromQ != null &&
                            path_clear_for_king(kToQ, rookFromQ) &&
                            path_clear_for_rook(rookFromQ, rookToQ) &&
                            king_path_safe(kToQ)
                        ) {
                            add_move(board, moves, kFrom, kToQ, BITS.QSIDE_CASTLE)
                        }
                    }
                } else {
                    /* king-side castling */
                    if (castling[us] & BITS.KSIDE_CASTLE) {
                        var castling_from = kings[us]
                        var castling_to = castling_from + 2

                        if (
                            board[castling_from + 1] == null &&
                            board[castling_to] == null &&
                            !attacked(them, kings[us]) &&
                            !attacked(them, castling_from + 1) &&
                            !attacked(them, castling_to)
                        ) {
                            add_move(board, moves, kings[us], castling_to, BITS.KSIDE_CASTLE)
                        }
                    }

                    /* queen-side castling */
                    if (castling[us] & BITS.QSIDE_CASTLE) {
                        var castling_from = kings[us]
                        var castling_to = castling_from - 2

                        if (
                            board[castling_from - 1] == null &&
                            board[castling_from - 2] == null &&
                            board[castling_from - 3] == null &&
                            !attacked(them, kings[us]) &&
                            !attacked(them, castling_from - 1) &&
                            !attacked(them, castling_to)
                        ) {
                            add_move(board, moves, kings[us], castling_to, BITS.QSIDE_CASTLE)
                        }
                    }
                }
            }
        }

        /* return all pseudo-legal moves (this includes moves that allow the king
         * to be captured)
         */
        if (!legal) {
            return moves
        }

        /* filter out illegal moves */
        var legal_moves = []
        for (var i = 0, len = moves.length; i < len; i++) {
            make_move(moves[i])
            if (!king_attacked(us)) {
                legal_moves.push(moves[i])
            }
            undo_move()
        }

        return legal_moves
    }

    /* convert a move from 0x88 coordinates to Standard Algebraic Notation
     * (SAN)
     *
     * @param {boolean} sloppy Use the sloppy SAN generator to work around over
     * disambiguation bugs in Fritz and Chessbase.  See below:
     *
     * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
     * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
     * 4. ... Ne7 is technically the valid SAN
     */
    function move_to_san(move, moves) {
        var output = ''

        if (move.flags & BITS.KSIDE_CASTLE) {
            output = 'O-O'
        } else if (move.flags & BITS.QSIDE_CASTLE) {
            output = 'O-O-O'
        } else {
            if (move.piece !== PAWN) {
                var disambiguator = get_disambiguator(move, moves)
                output += move.piece.toUpperCase() + disambiguator
            }

            if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
                if (move.piece === PAWN) {
                    output += algebraic(move.from)[0]
                }
                output += 'x'
            }

            output += algebraic(move.to)

            if (move.flags & BITS.PROMOTION) {
                output += '=' + move.promotion.toUpperCase()
            }
        }

        make_move(move)
        if (in_check()) {
            if (in_checkmate()) {
                output += '#'
            } else {
                output += '+'
            }
        }
        undo_move()

        return output
    }

    function attacked(color, square) {
        for (var i = SQUARE_MAP.a8; i <= SQUARE_MAP.h1; i++) {
            /* did we run off the end of the board */
            if (i & 0x88) {
                i += 7
                continue
            }

            /* if empty square or wrong color */
            if (board[i] == null || board[i].color !== color) continue

            var piece = board[i]
            var difference = i - square
            var index = difference + 119

            if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
                if (piece.type === PAWN) {
                    if (difference > 0) {
                        if (piece.color === WHITE) return true
                    } else {
                        if (piece.color === BLACK) return true
                    }
                    continue
                }

                /* if the piece is a knight or a king */
                if (piece.type === 'n' || piece.type === 'k') return true

                var offset = RAYS[index]
                var j = i + offset

                var blocked = false
                while (j !== square) {
                    if (board[j] != null) {
                        blocked = true
                        break
                    }
                    j += offset
                }

                if (!blocked) return true
            }
        }

        return false
    }

    function king_attacked(color) {
        return attacked(swap_color(color), kings[color])
    }

    function in_check() {
        return king_attacked(turn)
    }

    function in_checkmate() {
        return in_check() && generate_moves().length === 0
    }

    function in_stalemate() {
        return !in_check() && generate_moves().length === 0
    }

    function insufficient_material() {
        var pieces = {}
        var bishops = []
        var num_pieces = 0
        var sq_color = 0

        for (var i = SQUARE_MAP.a8; i <= SQUARE_MAP.h1; i++) {
            sq_color = (sq_color + 1) % 2
            if (i & 0x88) {
                i += 7
                continue
            }

            var piece = board[i]
            if (piece) {
                pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1
                if (piece.type === BISHOP) {
                    bishops.push(sq_color)
                }
                num_pieces++
            }
        }

        /* k vs. k */
        if (num_pieces === 2) {
            return true
        } else if (
            /* k vs. kn .... or .... k vs. kb */
            num_pieces === 3 &&
            (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)
        ) {
            return true
        } else if (num_pieces === pieces[BISHOP] + 2) {
            /* kb vs. kb where any number of bishops are all on the same color */
            var sum = 0
            var len = bishops.length
            for (var i = 0; i < len; i++) {
                sum += bishops[i]
            }
            if (sum === 0 || sum === len) {
                return true
            }
        }

        return false
    }

    function in_threefold_repetition() {
        /* TODO: while this function is fine for casual use, a better
         * implementation would use a Zobrist key (instead of FEN). the
         * Zobrist key would be maintained in the make_move/undo_move functions,
         * avoiding the costly that we do below.
         */
        var moves = []
        var positions = {}
        var repetition = false

        while (true) {
            var move = undo_move()
            if (!move) break
            moves.push(move)
        }

        while (true) {
            /* remove the last two fields in the FEN string, they're not needed
             * when checking for draw by rep */
            var fen = generate_fen().split(' ').slice(0, 4).join(' ')

            /* has the position occurred three or move times */
            positions[fen] = fen in positions ? positions[fen] + 1 : 1
            if (positions[fen] >= 3) {
                repetition = true
            }

            if (!moves.length) {
                break
            }
            make_move(moves.pop())
        }

        return repetition
    }

    function push(move) {
        history.push({
            move: move,
            kings: { b: kings.b, w: kings.w },
            turn: turn,
            castling: { b: castling.b, w: castling.w },
            ep_square: ep_square,
            half_moves: half_moves,
            move_number: move_number,
        })
    }

    function make_move(move) {
        var us = turn
        var them = swap_color(us)
        push(move)

        // Special handling for Chess960 castling where the king may not move (rook-move-only)
        var is960Castle = isChess960 && (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) && board[move.from] && board[move.from].type === KING
        if (is960Castle) {
            var rankSide = rank(move.from)
            var isK = !!(move.flags & BITS.KSIDE_CASTLE)
            var rookFromC = isK ? ROOKS[us][1].square : ROOKS[us][0].square
            var rookToC = isK
                ? (rankSide === RANK_1 ? SQUARE_MAP.f1 : SQUARE_MAP.f8)
                : (rankSide === RANK_1 ? SQUARE_MAP.d1 : SQUARE_MAP.d8)
            // If rook sits on king's destination in transposition castling, move rook first
            if (move.to !== move.from) {
                if (rookFromC === move.to) {
                    board[rookToC] = board[rookFromC]
                    board[rookFromC] = null
                }
                // now move king normally
                board[move.to] = board[move.from]
                board[move.from] = null
            } else {
                // rook-move-only: king stays; only move rook
                board[rookToC] = board[rookFromC]
                board[rookFromC] = null
            }
        } else {
            board[move.to] = board[move.from]
            board[move.from] = null
        }

        /* if ep capture, remove the captured pawn */
        if (move.flags & BITS.EP_CAPTURE) {
            if (turn === BLACK) {
                board[move.to - 16] = null
            } else {
                board[move.to + 16] = null
            }
        }

        /* if pawn promotion, replace with new piece */
        if (move.flags & BITS.PROMOTION) {
            board[move.to] = { type: move.promotion, color: us }
        }

        /* if we moved the king */
        if (board[move.to] && board[move.to].type === KING) {
            kings[board[move.to].color] = move.to

            /* if we castled, move the rook to its final square (when king actually moved) */
            if (move.flags & BITS.KSIDE_CASTLE) {
                if (isChess960) {
                    // If the king didn't move (rook-move-only), this was already handled above
                    if (move.to !== move.from) {
                        var rTo = (rank(move.to) === RANK_1 ? SQUARE_MAP.f1 : SQUARE_MAP.f8)
                        var rFrom = ROOKS[us][1].square
                        // If rook already moved (transposition), skip; else move it now
                        if (board[rTo] == null || (board[rTo] && board[rTo].type !== ROOK)) {
                            board[rTo] = board[rFrom]
                            board[rFrom] = null
                        }
                    }
                } else {
                    var castling_to = move.to - 1
                    var castling_from = move.to + 1
                    board[castling_to] = board[castling_from]
                    board[castling_from] = null
                }
            } else if (move.flags & BITS.QSIDE_CASTLE) {
                if (isChess960) {
                    if (move.to !== move.from) {
                        var rToQ = (rank(move.to) === RANK_1 ? SQUARE_MAP.d1 : SQUARE_MAP.d8)
                        var rFromQ = ROOKS[us][0].square
                        if (board[rToQ] == null || (board[rToQ] && board[rToQ].type !== ROOK)) {
                            board[rToQ] = board[rFromQ]
                            board[rFromQ] = null
                        }
                    }
                } else {
                    var castling_to = move.to + 1
                    var castling_from = move.to - 2
                    board[castling_to] = board[castling_from]
                    board[castling_from] = null
                }
            }

            /* turn off castling */
            castling[us] = ''
        }

        /* turn off castling if we move a rook */
        if (castling[us]) {
            for (var i = 0, len = ROOKS[us].length; i < len; i++) {
                if (
                    move.from === ROOKS[us][i].square &&
                    castling[us] & ROOKS[us][i].flag
                ) {
                    castling[us] ^= ROOKS[us][i].flag
                    break
                }
            }
        }

        /* turn off castling if we capture a rook */
        if (castling[them]) {
            for (var i = 0, len = ROOKS[them].length; i < len; i++) {
                if (
                    move.to === ROOKS[them][i].square &&
                    castling[them] & ROOKS[them][i].flag
                ) {
                    castling[them] ^= ROOKS[them][i].flag
                    break
                }
            }
        }

        /* if big pawn move, update the en passant square */
        if (move.flags & BITS.BIG_PAWN) {
            if (turn === 'b') {
                ep_square = move.to - 16
            } else {
                ep_square = move.to + 16
            }
        } else {
            ep_square = EMPTY
        }

        /* reset the 50 move counter if a pawn is moved or a piece is captured */
        if (move.piece === PAWN) {
            half_moves = 0
        } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
            half_moves = 0
        } else {
            half_moves++
        }

        if (turn === BLACK) {
            move_number++
        }
        turn = swap_color(turn)
    }

    function undo_move() {
        var old = history.pop()
        if (old == null) {
            return null
        }

        var move = old.move
        kings = old.kings
        turn = old.turn
        castling = old.castling
        ep_square = old.ep_square
        half_moves = old.half_moves
        move_number = old.move_number

        var us = turn
        var them = swap_color(turn)

        // Undo primary piece movement, except in Chess960 rook-move-only castling where the king didn't move
        var skipKingUndo = isChess960 && (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) && move.from === move.to
        if (!skipKingUndo) {
            board[move.from] = board[move.to]
            board[move.from].type = move.piece // to undo any promotions
            board[move.to] = null
        }

        if (move.flags & BITS.CAPTURE) {
            board[move.to] = { type: move.captured, color: them }
        } else if (move.flags & BITS.EP_CAPTURE) {
            var index
            if (us === BLACK) {
                index = move.to - 16
            } else {
                index = move.to + 16
            }
            board[index] = { type: PAWN, color: them }
        }

        if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
            if (isChess960) {
                var rFromU, rToU
                if (move.flags & BITS.KSIDE_CASTLE) {
                    rFromU = ROOKS[us][1].square
                    rToU = (rank(move.to) === RANK_1 ? SQUARE_MAP.f1 : SQUARE_MAP.f8)
                } else if (move.flags & BITS.QSIDE_CASTLE) {
                    rFromU = ROOKS[us][0].square
                    rToU = (rank(move.to) === RANK_1 ? SQUARE_MAP.d1 : SQUARE_MAP.d8)
                }
                // If king didn't move (rook-move-only), the king is already on move.from/move.to; just move rook back
                board[rFromU] = board[rToU]
                board[rToU] = null
            } else {
                var castling_to, castling_from
                if (move.flags & BITS.KSIDE_CASTLE) {
                    castling_to = move.to + 1
                    castling_from = move.to - 1
                } else if (move.flags & BITS.QSIDE_CASTLE) {
                    castling_to = move.to - 2
                    castling_from = move.to + 1
                }

                board[castling_to] = board[castling_from]
                board[castling_from] = null
            }
        }

        return move
    }

    // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
    function move_from_san(move, sloppy) {
        // strip off any move decorations: e.g Nf3+?! becomes Nf3
        var clean_move = stripped_san(move)

        // the move parsers is a 2-step state
        for (var parser = 0; parser < 2; parser++) {
            if (parser == PARSER_SLOPPY) {
                // only run the sloppy parse if explicitly requested
                if (!sloppy) {
                    return null
                }

                // The sloppy parser allows the user to parse non-standard chess
                // notations. This parser is opt-in (by specifying the
                // '{ sloppy: true }' setting) and is only run after the Standard
                // Algebraic Notation (SAN) parser has failed.
                //
                // When running the sloppy parser, we'll run a regex to grab the piece,
                // the to/from square, and an optional promotion piece. This regex will
                // parse common non-standard notation like: Pe2-e4, Rc1c4, Qf3xf7,
                // f7f8q, b1c3

                // NOTE: Some positions and moves may be ambiguous when using the
                // sloppy parser. For example, in this position:
                // 6k1/8/8/B7/8/8/8/BN4K1 w - - 0 1, the move b1c3 may be interpreted
                // as Nc3 or B1c3 (a disambiguated bishop move). In these cases, the
                // sloppy parser will default to the most most basic interpretation
                // (which is b1c3 parsing to Nc3).

                // FIXME: these var's are hoisted into function scope, this will need
                // to change when switching to const/let

                var overly_disambiguated = false

                var matches = clean_move.match(
                    /([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/
                )
                if (matches) {
                    var piece = matches[1]
                    var from = matches[2]
                    var to = matches[3]
                    var promotion = matches[4]

                    if (from.length == 1) {
                        overly_disambiguated = true
                    }
                } else {
                    // The [a-h]?[1-8]? portion of the regex below handles moves that may
                    // be overly disambiguated (e.g. Nge7 is unnecessary and non-standard
                    // when there is one legal knight move to e7). In this case, the value
                    // of 'from' variable will be a rank or file, not a square.
                    var matches = clean_move.match(
                        /([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/
                    )

                    if (matches) {
                        var piece = matches[1]
                        var from = matches[2]
                        var to = matches[3]
                        var promotion = matches[4]

                        if (from.length == 1) {
                            var overly_disambiguated = true
                        }
                    }
                }
            }

            var piece_type = infer_piece_type(clean_move)
            var moves = generate_moves({
                legal: true,
                piece: piece ? piece : piece_type,
            })

            for (var i = 0, len = moves.length; i < len; i++) {
                switch (parser) {
                    case PARSER_STRICT: {
                        if (clean_move === stripped_san(move_to_san(moves[i], moves))) {
                            return moves[i]
                        }
                        break
                    }
                    case PARSER_SLOPPY: {
                        if (matches) {
                            // hand-compare move properties with the results from our sloppy
                            // regex
                            if (
                                (!piece || piece.toLowerCase() == moves[i].piece) &&
                                SQUARE_MAP[from] == moves[i].from &&
                                SQUARE_MAP[to] == moves[i].to &&
                                (!promotion || promotion.toLowerCase() == moves[i].promotion)
                            ) {
                                return moves[i]
                            } else if (overly_disambiguated) {
                                // SPECIAL CASE: we parsed a move string that may have an
                                // unneeded rank/file disambiguator (e.g. Nge7).  The 'from'
                                // variable will
                                var square = algebraic(moves[i].from)
                                if (
                                    (!piece || piece.toLowerCase() == moves[i].piece) &&
                                    SQUARE_MAP[to] == moves[i].to &&
                                    (from == square[0] || from == square[1]) &&
                                    (!promotion || promotion.toLowerCase() == moves[i].promotion)
                                ) {
                                    return moves[i]
                                }
                            }
                        }
                    }
                }
            }
        }

        return null
    }

    /* pretty = external move object */
    function make_pretty(ugly_move) {
        var move = clone(ugly_move)
        move.san = move_to_san(move, generate_moves({ legal: true }))
        move.to = algebraic(move.to)
        move.from = algebraic(move.from)

        var flags = ''

        for (var flag in BITS) {
            if (BITS[flag] & move.flags) {
                flags += FLAGS[flag]
            }
        }
        move.flags = flags

        return move
    }

    /*****************************************************************************
     * DEBUGGING UTILITIES
     ****************************************************************************/
    function perft(depth) {
        var moves = generate_moves({ legal: false })
        var nodes = 0
        var color = turn

        for (var i = 0, len = moves.length; i < len; i++) {
            make_move(moves[i])
            if (!king_attacked(color)) {
                if (depth - 1 > 0) {
                    var child_nodes = perft(depth - 1)
                    nodes += child_nodes
                } else {
                    nodes++
                }
            }
            undo_move()
        }

        return nodes
    }

    return {
        /***************************************************************************
         * PUBLIC API
         **************************************************************************/
        load: function (fen) {
            return load(fen)
        },

        reset: function () {
            return reset()
        },

        moves: function (options) {
            /* The internal representation of a chess move is in 0x88 format, and
             * not meant to be human-readable.  The code below converts the 0x88
             * square coordinates to algebraic coordinates.  It also prunes an
             * unnecessary move keys resulting from a verbose call.
             */

            var ugly_moves = generate_moves(options)
            var moves = []

            for (var i = 0, len = ugly_moves.length; i < len; i++) {
                /* does the user want a full move object (most likely not), or just
                 * SAN
                 */
                if (
                    typeof options !== 'undefined' &&
                    'verbose' in options &&
                    options.verbose
                ) {
                    moves.push(make_pretty(ugly_moves[i]))
                } else {
                    moves.push(
                        move_to_san(ugly_moves[i], generate_moves({ legal: true }))
                    )
                }
            }

            return moves
        },

        in_check: function () {
            return in_check()
        },

        in_checkmate: function () {
            return in_checkmate()
        },

        in_stalemate: function () {
            return in_stalemate()
        },

        in_draw: function () {
            return (
                half_moves >= 100 ||
                in_stalemate() ||
                insufficient_material() ||
                in_threefold_repetition()
            )
        },

        insufficient_material: function () {
            return insufficient_material()
        },

        in_threefold_repetition: function () {
            return in_threefold_repetition()
        },

        game_over: function () {
            return (
                half_moves >= 100 ||
                in_checkmate() ||
                in_stalemate() ||
                insufficient_material() ||
                in_threefold_repetition()
            )
        },

        validate_fen: function (fen) {
            return validate_fen(fen)
        },

        fen: function () {
            return generate_fen()
        },

        board: function () {
            var output = [],
                row = []

            for (var i = SQUARE_MAP.a8; i <= SQUARE_MAP.h1; i++) {
                if (board[i] == null) {
                    row.push(null)
                } else {
                    row.push({
                        square: algebraic(i),
                        type: board[i].type,
                        color: board[i].color,
                    })
                }
                if ((i + 1) & 0x88) {
                    output.push(row)
                    row = []
                    i += 8
                }
            }

            return output
        },

        pgn: function (options) {
            /* using the specification from http://www.chessclub.com/help/PGN-spec
             * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
             */
            var newline =
                typeof options === 'object' && typeof options.newline_char === 'string'
                    ? options.newline_char
                    : '\n'
            var max_width =
                typeof options === 'object' && typeof options.max_width === 'number'
                    ? options.max_width
                    : 0
            var result = []
            var header_exists = false

            /* add the PGN header information */
            for (var i in header) {
                /* TODO: order of enumerated properties in header object is not
                 * guaranteed, see ECMA-262 spec (section 12.6.4)
                 */
                result.push('[' + i + ' "' + header[i] + '"]' + newline)
                header_exists = true
            }

            if (header_exists && history.length) {
                result.push(newline)
            }

            var append_comment = function (move_string) {
                var comment = comments[generate_fen()]
                if (typeof comment !== 'undefined') {
                    var delimiter = move_string.length > 0 ? ' ' : ''
                    move_string = `${move_string}${delimiter}{${comment}}`
                }
                return move_string
            }

            /* pop all of history onto reversed_history */
            var reversed_history = []
            while (history.length > 0) {
                reversed_history.push(undo_move())
            }

            var moves = []
            var move_string = ''

            /* special case of a commented starting position with no moves */
            if (reversed_history.length === 0) {
                moves.push(append_comment(''))
            }

            /* build the list of moves.  a move_string looks like: "3. e3 e6" */
            while (reversed_history.length > 0) {
                move_string = append_comment(move_string)
                var move = reversed_history.pop()

                /* if the position started with black to move, start PGN with #. ... */
                if (!history.length && move.color === 'b') {
                    const prefix = `${move_number}. ...`
                    /* is there a comment preceding the first move? */
                    move_string = move_string ? `${move_string} ${prefix}` : prefix
                } else if (move.color === 'w') {
                    /* store the previous generated move_string if we have one */
                    if (move_string.length) {
                        moves.push(move_string)
                    }
                    move_string = move_number + '.'
                }

                move_string =
                    move_string + ' ' + move_to_san(move, generate_moves({ legal: true }))
                make_move(move)
            }

            /* are there any other leftover moves? */
            if (move_string.length) {
                moves.push(append_comment(move_string))
            }

            /* is there a result? */
            if (typeof header.Result !== 'undefined') {
                moves.push(header.Result)
            }

            /* history should be back to what it was before we started generating PGN,
             * so join together moves
             */
            if (max_width === 0) {
                return result.join('') + moves.join(' ')
            }

            var strip = function () {
                if (result.length > 0 && result[result.length - 1] === ' ') {
                    result.pop()
                    return true
                }
                return false
            }

            /* NB: this does not preserve comment whitespace. */
            var wrap_comment = function (width, move) {
                for (var token of move.split(' ')) {
                    if (!token) {
                        continue
                    }
                    if (width + token.length > max_width) {
                        while (strip()) {
                            width--
                        }
                        result.push(newline)
                        width = 0
                    }
                    result.push(token)
                    width += token.length
                    result.push(' ')
                    width++
                }
                if (strip()) {
                    width--
                }
                return width
            }

            /* wrap the PGN output at max_width */
            var current_width = 0
            for (var i = 0; i < moves.length; i++) {
                if (current_width + moves[i].length > max_width) {
                    if (moves[i].includes('{')) {
                        current_width = wrap_comment(current_width, moves[i])
                        continue
                    }
                }
                /* if the current move will push past max_width */
                if (current_width + moves[i].length > max_width && i !== 0) {
                    /* don't end the line with whitespace */
                    if (result[result.length - 1] === ' ') {
                        result.pop()
                    }

                    result.push(newline)
                    current_width = 0
                } else if (i !== 0) {
                    result.push(' ')
                    current_width++
                }
                result.push(moves[i])
                current_width += moves[i].length
            }

            return result.join('')
        },

        load_pgn: function (pgn, options) {
            // allow the user to specify the sloppy move parser to work around over
            // disambiguation bugs in Fritz and Chessbase
            var sloppy =
                typeof options !== 'undefined' && 'sloppy' in options
                    ? options.sloppy
                    : false

            function mask(str) {
                return str.replace(/\\/g, '\\')
            }

            function parse_pgn_header(header, options) {
                var newline_char =
                    typeof options === 'object' &&
                    typeof options.newline_char === 'string'
                        ? options.newline_char
                        : '\r?\n'
                var header_obj = {}
                var headers = header.split(new RegExp(mask(newline_char)))
                var key = ''
                var value = ''

                for (var i = 0; i < headers.length; i++) {
                    var regex = /^\s*\[([A-Za-z]+)\s*"(.*)"\s*\]\s*$/
                    key = headers[i].replace(regex, '$1')
                    value = headers[i].replace(regex, '$2')
                    if (trim(key).length > 0) {
                        header_obj[key] = value
                    }
                }

                return header_obj
            }

            // strip whitespace from head/tail of PGN block
            pgn = pgn.trim()

            var newline_char =
                typeof options === 'object' && typeof options.newline_char === 'string'
                    ? options.newline_char
                    : '\r?\n'

            // RegExp to split header. Takes advantage of the fact that header and movetext
            // will always have a blank line between them (ie, two newline_char's).
            // With default newline_char, will equal: /^(\[((?:\r?\n)|.)*\])(?:\s*\r?\n){2}/
            var header_regex = new RegExp(
                '^(\\[((?:' +
                mask(newline_char) +
                ')|.)*\\])' +
                '(?:\\s*' +
                mask(newline_char) +
                '){2}'
            )

            // If no header given, begin with moves.
            var header_string = header_regex.test(pgn)
                ? header_regex.exec(pgn)[1]
                : ''

            // Put the board in the starting position
            reset()

            /* parse PGN header */
            var headers = parse_pgn_header(header_string, options)
            var fen = ''

            for (var key in headers) {
                // check to see user is including fen (possibly with wrong tag case)
                if (key.toLowerCase() === 'fen') {
                    fen = headers[key]
                }
                set_header([key, headers[key]])
            }

            /* sloppy parser should attempt to load a fen tag, even if it's
             * the wrong case and doesn't include a corresponding [SetUp "1"] tag */
            if (sloppy) {
                if (fen) {
                    if (!load(fen, true)) {
                        return false
                    }
                }
            } else {
                /* strict parser - load the starting position indicated by [Setup '1']
                 * and [FEN position] */
                if (headers['SetUp'] === '1') {
                    if (!('FEN' in headers && load(headers['FEN'], true))) {
                        // second argument to load: don't clear the headers
                        return false
                    }
                }
            }

            /* NB: the regexes below that delete move numbers, recursive
             * annotations, and numeric annotation glyphs may also match
             * text in comments. To prevent this, we transform comments
             * by hex-encoding them in place and decoding them again after
             * the other tokens have been deleted.
             *
             * While the spec states that PGN files should be ASCII encoded,
             * we use {en,de}codeURIComponent here to support arbitrary UTF8
             * as a convenience for modern users */

            var to_hex = function (string) {
                return Array.from(string)
                    .map(function (c) {
                        /* encodeURI doesn't transform most ASCII characters,
                         * so we handle these ourselves */
                        return c.charCodeAt(0) < 128
                            ? c.charCodeAt(0).toString(16)
                            : encodeURIComponent(c).replace(/\%/g, '').toLowerCase()
                    })
                    .join('')
            }

            var from_hex = function (string) {
                return string.length == 0
                    ? ''
                    : decodeURIComponent('%' + string.match(/.{1,2}/g).join('%'))
            }

            var encode_comment = function (string) {
                string = string.replace(new RegExp(mask(newline_char), 'g'), ' ')
                return `{${to_hex(string.slice(1, string.length - 1))}}`
            }

            var decode_comment = function (string) {
                if (string.startsWith('{') && string.endsWith('}')) {
                    return from_hex(string.slice(1, string.length - 1))
                }
            }

            /* delete header to get the moves */
            var ms = pgn
                .replace(header_string, '')
                .replace(
                    /* encode comments so they don't get deleted below */
                    new RegExp(`(\{[^}]*\})+?|;([^${mask(newline_char)}]*)`, 'g'),
                    function (match, bracket, semicolon) {
                        return bracket !== undefined
                            ? encode_comment(bracket)
                            : ' ' + encode_comment(`{${semicolon.slice(1)}}`)
                    }
                )
                .replace(new RegExp(mask(newline_char), 'g'), ' ')

            /* delete recursive annotation variations */
            var rav_regex = /(\([^\(\)]+\))+?/g
            while (rav_regex.test(ms)) {
                ms = ms.replace(rav_regex, '')
            }

            /* delete move numbers */
            ms = ms.replace(/\d+\.(\.\.)?/g, '')

            /* delete ... indicating black to move */
            ms = ms.replace(/\.\.\./g, '')

            /* delete numeric annotation glyphs */
            ms = ms.replace(/\$\d+/g, '')

            /* trim and get array of moves */
            var moves = trim(ms).split(new RegExp(/\s+/))

            /* delete empty entries */
            moves = moves.join(',').replace(/,,+/g, ',').split(',')
            var move = ''

            var result = ''

            for (var half_move = 0; half_move < moves.length; half_move++) {
                var comment = decode_comment(moves[half_move])
                if (comment !== undefined) {
                    comments[generate_fen()] = comment
                    continue
                }

                move = move_from_san(moves[half_move], sloppy)

                /* invalid move */
                if (move == null) {
                    /* was the move an end of game marker */
                    if (TERMINATION_MARKERS.indexOf(moves[half_move]) > -1) {
                        result = moves[half_move]
                    } else {
                        return false
                    }
                } else {
                    /* reset the end of game marker if making a valid move */
                    result = ''
                    make_move(move)
                }
            }

            /* Per section 8.2.6 of the PGN spec, the Result tag pair must match
             * match the termination marker. Only do this when headers are present,
             * but the result tag is missing
             */
            if (result && Object.keys(header).length && !header['Result']) {
                set_header(['Result', result])
            }

            return true
        },

        header: function () {
            return set_header(arguments)
        },

        turn: function () {
            return turn
        },

        move: function (move, options) {
            /* The move function can be called with in the following parameters:
             *
             * .move('Nxb7')      <- where 'move' is a case-sensitive SAN string
             *
             * .move({ from: 'h7', <- where the 'move' is a move object (additional
             *         to :'h8',      fields are ignored)
             *         promotion: 'q',
             *      })
             */

            // allow the user to specify the sloppy move parser to work around over
            // disambiguation bugs in Fritz and Chessbase
            var sloppy =
                typeof options !== 'undefined' && 'sloppy' in options
                    ? options.sloppy
                    : false

            var move_obj = null

            if (typeof move === 'string') {
                move_obj = move_from_san(move, sloppy)
            } else if (typeof move === 'object') {
                var moves = generate_moves()

                /* convert the pretty move object to an ugly move object */
                for (var i = 0, len = moves.length; i < len; i++) {
                    if (
                        move.from === algebraic(moves[i].from) &&
                        move.to === algebraic(moves[i].to) &&
                        (!('promotion' in moves[i]) ||
                            move.promotion === moves[i].promotion)
                    ) {
                        move_obj = moves[i]
                        break
                    }
                }
            }

            /* failed to find move */
            if (!move_obj) {
                return null
            }

            /* need to make a copy of move because we can't generate SAN after the
             * move is made
             */
            var pretty_move = make_pretty(move_obj)

            make_move(move_obj)

            return pretty_move
        },

        undo: function () {
            var move = undo_move()
            return move ? make_pretty(move) : null
        },

        clear: function () {
            return clear()
        },

        put: function (piece, square) {
            return put(piece, square)
        },

        get: function (square) {
            return get(square)
        },

        ascii() {
            var s = '   +------------------------+\n'
            for (var i = SQUARE_MAP.a8; i <= SQUARE_MAP.h1; i++) {
                /* display the rank */
                if (file(i) === 0) {
                    s += ' ' + '87654321'[rank(i)] + ' |'
                }

                /* empty piece */
                if (board[i] == null) {
                    s += ' . '
                } else {
                    var piece = board[i].type
                    var color = board[i].color
                    var symbol =
                        color === WHITE ? piece.toUpperCase() : piece.toLowerCase()
                    s += ' ' + symbol + ' '
                }

                if ((i + 1) & 0x88) {
                    s += '|\n'
                    i += 8
                }
            }
            s += '   +------------------------+\n'
            s += '     a  b  c  d  e  f  g  h'

            return s
        },

        remove: function (square) {
            return remove(square)
        },

        perft: function (depth) {
            return perft(depth)
        },

        square_color: function (square) {
            if (square in SQUARE_MAP) {
                var sq_0x88 = SQUARE_MAP[square]
                return (rank(sq_0x88) + file(sq_0x88)) % 2 === 0 ? 'light' : 'dark'
            }

            return null
        },

        history: function (options) {
            var reversed_history = []
            var move_history = []
            var verbose =
                typeof options !== 'undefined' &&
                'verbose' in options &&
                options.verbose

            while (history.length > 0) {
                reversed_history.push(undo_move())
            }

            while (reversed_history.length > 0) {
                var move = reversed_history.pop()
                if (verbose) {
                    move_history.push(make_pretty(move))
                } else {
                    move_history.push(move_to_san(move, generate_moves({ legal: true })))
                }
                make_move(move)
            }

            return move_history
        },

        get_comment: function () {
            return comments[generate_fen()]
        },

        set_comment: function (comment) {
            comments[generate_fen()] = comment.replace('{', '[').replace('}', ']')
        },

        delete_comment: function () {
            var comment = comments[generate_fen()]
            delete comments[generate_fen()]
            return comment
        },

        get_comments: function () {
            prune_comments()
            return Object.keys(comments).map(function (fen) {
                return { fen: fen, comment: comments[fen] }
            })
        },

        delete_comments: function () {
            prune_comments()
            return Object.keys(comments).map(function (fen) {
                var comment = comments[fen]
                delete comments[fen]
                return { fen: fen, comment: comment }
            })
        },
    }
}