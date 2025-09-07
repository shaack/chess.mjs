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

/**
 * Anpassungen für Chess960 gekennzeichnet durch "Chess960"-Kommentar.
 * Öffentliche API unverändert, nur eergänzt um Getter für isVariant960
 * Functions für Startpositionen Chess960 exportiert (s. letzter Abschnitt).
 */

const SYMBOLS = 'pnbrqkPNBRQK'

const DEFAULT_POSITION =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

const TERMINATION_MARKERS = ['1-0', '0-1', '1/2-1/2', '*']

const PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15],
}

const PIECE_OFFSETS = {
    n: [-18, -33, -31, -14, 18, 33, 31, 14],
    b: [-17, -15, 17, 15],
    r: [-16, 1, 16, -1],
    q: [-17, -16, -15, 1, 17, 16, 15, -1],
    k: [-17, -16, -15, 1, 17, 16, 15, -1],
}

// prettier-ignore
const ATTACKS = [
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
    0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
    0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
    0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
    0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    24,24,24,24,24,24,56,  0, 56,24,24,24,24,24,24, 0,
    0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
    0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
    0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
    0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20
];

// prettier-ignore
const RAYS = [
    17,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
    0, 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
    0,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
    0,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
    0,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
    0,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
    0,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
    1,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
    0,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
    0,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
    0,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
    0,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
    0,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
    0,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
    -15,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17
];

const SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 }

const BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64,
}

const RANK_1 = 7
const RANK_2 = 6
const RANK_3 = 5
const RANK_4 = 4
const RANK_5 = 3
const RANK_6 = 2
const RANK_7 = 1
const RANK_8 = 0

// prettier-ignore
const SQUARE_MAP = {
    a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
    a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
    a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
    a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
    a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
    a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
    a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
};


// SQUARE_MAP von algebraischer Notation zu Index (0x88)
const FILES = 'abcdefgh';
const RANKS = '12345678';

const PARSER_STRICT = 0
const PARSER_SLOPPY = 1

/* this function is used to uniquely identify ambiguous moves */
function get_disambiguator(move, moves) {
    var from = move.from
    var to = move.to
    var piece = move.piece

    var ambiguities = 0
    var same_rank = 0
    var same_file = 0

    for (var i = 0, len = moves.length; i < len; i++) {
        var ambig_from = moves[i].from
        var ambig_to = moves[i].to
        var ambig_piece = moves[i].piece

        /* if a move of the same piece type ends on the same to square, we'll
         * need to add a disambiguator to the algebraic notation
         */
        if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
            ambiguities++

            if (rank(from) === rank(ambig_from)) {
                same_rank++
            }

            if (file(from) === file(ambig_from)) {
                same_file++
            }
        }
    }

    if (ambiguities > 0) {
        /* if there exists a similar moving piece on the same rank and file as
         * the move in question, use the square as the disambiguator
         */
        if (same_rank > 0 && same_file > 0) {
            return algebraic(from)
        } else if (same_file > 0) {
            /* if the moving piece rests on the same file, use the rank symbol as the
             * disambiguator
             */
            return algebraic(from).charAt(1)
        } else {
            /* else use the file symbol */
            return algebraic(from).charAt(0)
        }
    }

    return ''
}

function infer_piece_type(san) {
    var piece_type = san.charAt(0)
    if (piece_type >= 'a' && piece_type <= 'h') {
        var matches = san.match(/[a-h]\d.*[a-h]\d/)
        if (matches) {
            return undefined
        }
        return PAWN
    }
    piece_type = piece_type.toLowerCase()
    if (piece_type === 'o') {
        return KING
    }
    return piece_type
}

// parses all of the decorators out of a SAN string
function stripped_san(move) {
    return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '')
}

/*****************************************************************************
 * UTILITY FUNCTIONS
 ****************************************************************************/
function rank(i) {
    return i >> 4
}

function file(i) {
    return i & 15
}

function algebraic(i) {
    var f = file(i),
        r = rank(i)
    return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1)
}

function swap_color(c) {
    return c === WHITE ? BLACK : WHITE
}

function is_digit(c) {
    return '0123456789'.indexOf(c) !== -1
}

function clone(obj) {
    var dupe = obj instanceof Array ? [] : {}

    for (var property in obj) {
        if (typeof property === 'object') {
            dupe[property] = clone(obj[property])
        } else {
            dupe[property] = obj[property]
        }
    }

    return dupe
}

function trim(str) {
    return str.replace(/^\s+|\s+$/g, '')
}


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

export const SQUARES = (function () {
    /* from the ECMA-262 spec (section 12.6.4):
     * "The mechanics of enumerating the properties ... is
     * implementation dependent"
     * so: for (var sq in SQUARES) { keys.push(sq); } might not be
     * ordered correctly
     */
    var keys = []
    for (var i = SQUARE_MAP.a8; i <= SQUARE_MAP.h1; i++) {
        if (i & 0x88) {
            i += 7
            continue
        }
        keys.push(algebraic(i))
    }
    return keys
})()

export const FLAGS = {
    NORMAL: 'n',
    CAPTURE: 'c',
    BIG_PAWN: 'b', // Doppelschritt eines Bauern
    EP_CAPTURE: 'e',
    PROMOTION: 'p',
    KSIDE_CASTLE: 'k',
    QSIDE_CASTLE: 'q',
}

/***************************************************************************
 * PUBLIC Functions - siehe export am Modulende
 **************************************************************************/

/**
 * Chess960
 *
 * Generiert eine FEN-Startposition für Standard-Schach oder Chess960.
 *
 * Parameter:
 *   options.id (optional) - ID der Chess960-Position (0-959). Wenn nicht angegeben, zufällig generiert.
 *   options.chess960 (optional, default=false) - true für Chess960, false für Standard-Schach.
 *   options.includePGNTags (optional, default=false) - Wenn true, gibt die PGN-Tag-Section inklusive FEN zurück.
 *
 * Rückgabe:
 *   String - FEN-String oder PGN-Tag-Section je nach includePGNTags.
 */
function generateStartPositionFEN({ id, chess960 = false, includePGNTags = false } = {}) {
    const fileNames = 'abcdefgh';

    // 10 mögliche KRN-Muster (König, Springer, Springer, Turm, Turm) für die 5 verbleibenden Figuren
    const KRN = ["NNRKR", "NRNKR", "NRKNR", "NRKRN", "RNNKR", "RNKNR", "RNKRN", "RKNNR", "RKNRN", "RKRNN"];

    let whiteRank = '';

    if (!chess960) {
        // Standard-Schach: klassische Ausgangsstellung
        whiteRank = 'RNBQKBNR';
    } else {
        // → Chess960 aktiv: ID validieren oder zufällig generieren
        if (id === undefined || id === null) {
            id = Math.floor(Math.random() * 960); // zufällige ID zwischen 0 und 959
        } else if (typeof id !== 'number' || id < 0 || id > 959) {
            throw new Error("Invalid Chess960 ID: " + id);
        }

        const pos = Array(8).fill(null); // Array mit 8 Feldern für die erste Reihe

        // -----------------------------
        // 1. Läuferpositionen bestimmen
        // -----------------------------
        let q = Math.floor(id / 4); // 0–239
        let r = id % 4;             // 0–3 → steuert hellen Läufer (auf ungeraden Feldern: 1,3,5,7)
        pos[r * 2 + 1] = "B";

        r = q % 4;                  // 0–3 → steuert dunklen Läufer (auf geraden Feldern: 0,2,4,6)
        q = Math.floor(q / 4);
        pos[r * 2] = "B";

        // -----------------------------
        // 2. Dame setzen
        // -----------------------------
        r = q % 6;                  // 0–5 → Position auf freiem Feld
        q = Math.floor(q / 6);
        let empty = pos.map((v, i) => v === null ? i : null).filter(i => i !== null);
        pos[empty[r]] = "Q";

        // -----------------------------
        // 3. KRN (König, Springer, Springer, Turm, Turm)
        // -----------------------------
        const krn = KRN[q].split('');
        pos.forEach((v, i) => {
            if (v === null) {
                pos[i] = krn.shift(); // restliche Figuren einsetzen
            }
        });

        // Ergebnis: weiße Grundreihe
        whiteRank = pos.join('');
    }

    // Schwarze Grundreihe ist die Kleinschreibung der weißen
    const blackRank = whiteRank.toLowerCase();

    // ------------------------------------
    // Rochaderechte ermitteln (Chess960!)
    // ------------------------------------
    let castlingRights = '-';
    if (!chess960) {
        castlingRights = 'KQkq'; // klassische Rochaderechte
    } else {
        const rookIndices = [];
        for (let i = 0; i < 8; i++) {
            if (whiteRank[i] === 'R') rookIndices.push(i); // Positionen der weißen Türme
        }
        const kingIndex = whiteRank.indexOf('K'); // Position des Königs

        // Weiße Rochaderechte → Großbuchstaben der Turm-Files (A–H)
        const whiteRights = rookIndices.map(i => fileNames[i].toUpperCase()).join('');
        // Schwarze Rochaderechte spiegeln → Kleinbuchstaben
        const blackRights = rookIndices.map(i => fileNames[i]).join('');
        castlingRights = whiteRights + blackRights;
    }

    // --------------------------------------
    // FEN-Zeile zusammenbauen
    // --------------------------------------
    const fen = `${blackRank}/pppppppp/8/8/8/8/PPPPPPPP/${whiteRank} w ${castlingRights} - 0 1`;

    // Optional: PGN-Tags erzeugen
    if (includePGNTags) {
        const tags = [
            `[Event "Chess960 Game"]`,
            `[Site "?"]`,
            `[Date "${new Date().toISOString().slice(0, 10)}"]`,
            `[Round "-"]`,
            `[White "?"]`,
            `[Black "?"]`,
            `[Result "*"]`,
            `[Variant "${chess960 ? 'Chess960' : 'Standard'}"]`,
            `[FEN "${fen}"]`,
            ``,
            `*`
        ];
        return tags.join('\n');
    }
    return fen;
}

/**
 * Ermittelt die Chess960-ID (0–959) aus einer gültigen FEN-Zeile.
 *  https://www.mark-weeks.com/cfaa/chess960/c960strt.htm
 *
 * Führt dabei eine vollständige Validierung der Startstellung durch:
 * - Genau 1 König
 * - Genau 2 Türme
 * - Genau 2 Läufer (auf ungleichen Farben)
 * - König steht zwischen den Türmen
 *
 * @param {string} fen - FEN-Zeile der Startstellung (nur erste Rank wird verwendet)
 * @returns {number|null} - Chess960-ID (0–959), oder null bei ungültiger Stellung
 */
function decodeChess960IdFromFEN(fen) {
    const KRN = ["NNRKR", "NRNKR", "NRKNR", "NRKRN", "RNNKR", "RNKNR", "RNKRN", "RKNNR", "RKNRN", "RKRNN"];

    const fields = fen.trim().split(/\s+/);
    if (fields.length < 1) return null;

    const ranks = fields[0].split('/');
    if (ranks.length !== 8) return null;

    const backRank = ranks[7];
    if (backRank.length !== 8) return null;

    const pos = backRank.split('');

    // Figuren zählen und prüfen
    const counts = { K: 0, Q: 0, R: 0, B: 0, N: 0 };
    for (const p of pos) {
        if (!counts.hasOwnProperty(p)) return null;
        counts[p]++;
    }
    if (counts.K !== 1 || counts.Q !== 1 || counts.R !== 2 || counts.B !== 2 || counts.N !== 2) return null;

    // Läuferpositionen
    const bishops = pos.map((p, i) => p === 'B' ? i : -1).filter(i => i !== -1);
    if (bishops.length !== 2 || bishops[0] % 2 === bishops[1] % 2) return null;

    const darkBishop = bishops.find(i => i % 2 === 0);
    const lightBishop = bishops.find(i => i % 2 === 1);

    const darkIdx = darkBishop / 2;
    const lightIdx = (lightBishop - 1) / 2;

    if (!Number.isInteger(darkIdx) || !Number.isInteger(lightIdx)) return null;

    const bishopPart = lightIdx + 4 * darkIdx;

    // Dame position in freien Feldern
    const fixedIndices = [darkBishop, lightBishop];
    const queenIndex = pos.indexOf('Q');
    const freeForQueen = [];
    for (let i = 0; i < 8; i++) {
        if (!fixedIndices.includes(i)) freeForQueen.push(i);
    }
    const queenPart = freeForQueen.indexOf(queenIndex);
    if (queenPart === -1) return null;

    // KRN-Code
    const krnStr = pos.filter(p => ['K', 'R', 'N'].includes(p)).join('');
    const krnCode = KRN.indexOf(krnStr);
    if (krnCode === -1) return null;

    // ID zusammensetzen
    const id = bishopPart + 16 * (queenPart + 6 * krnCode);
    return id;
}

/* Definition von Chess - "Constructor" */
const Chess = function (fen, options = {}) {
    let isChess960 = !!options.chess960; // ← Instanzspezifisch
    var board = new Array(128)
    var kings = { w: EMPTY, b: EMPTY }
    var rooks = { w: [], b: [] }; // rooks dynamisch machen für Chess960
    var castling_moves = {
        w: { kingside: null, queenside: null },
        b: { kingside: null, queenside: null },
    }; // Speichern der in load() ermittelten Rochadezüge
    var turn = WHITE
    var castling = { w: 0, b: 0 }
    var ep_square = EMPTY
    var half_moves = 0
    var move_number = 1
    var history = []
    var header = {}
    var comments = {}

    /* if the user passes in a fen string, load it, else default to
     * starting position
     */
    if (typeof fen === 'undefined') {
        load(DEFAULT_POSITION)
    } else {
        load(fen)
    }

    // Hilfsfunktion, um Türme dynamisch zu ermitteln (Chess960-kompatibel)
    function update_rooks() {
        const files = 'abcdefgh';
        const ranks = { w: '1', b: '8' };
        ['w', 'b'].forEach(color => {
            rooks[color] = [];
            for (let i = 0; i < 8; i++) {
                const square = files[i] + ranks[color];
                const sqIdx = SQUARE_MAP[square];
                const piece = board[sqIdx];
                if (piece && piece.type === ROOK && piece.color === color) {
                    const flag = (sqIdx < kings[color])
                        ? BITS.QSIDE_CASTLE
                        : BITS.KSIDE_CASTLE;
                    rooks[color].push({ square: sqIdx, flag });
                }
            }
        });
    }

    // Speichert die Position der Rochade-Figuren aus der Start-FEN
    function prepare_castling_moves() {
        castling_moves = {
            w: { kingside: null, queenside: null },
            b: { kingside: null, queenside: null },
        };

        ['w', 'b'].forEach(color => {
            const ksq = kings[color];
            if (ksq === EMPTY) return;

            const rank = color === 'w' ? '1' : '8';

            for (const { square: rsq, flag } of rooks[color]) {
                // Hat diese Seite überhaupt noch das Rochaderecht?
                if (!(castling[color] & flag)) continue;

                // Bestimme Rochade-Ziel-Felder
                const kFile = FILES[ksq & 0x0F];
                const rFile = FILES[rsq & 0x0F];

                // Ziel-Felder nach Chess960-Regel:
                const king_to = SQUARE_MAP[(flag === BITS.KSIDE_CASTLE ? 'g' : 'c') + rank];
                const rook_to = SQUARE_MAP[(flag === BITS.KSIDE_CASTLE ? 'f' : 'd') + rank];

                const move = {
                    king_from: ksq,
                    king_to,
                    rook_from: rsq,
                    rook_to,
                };

                if (flag === BITS.KSIDE_CASTLE) {
                    castling_moves[color].kingside = move;
                } else if (flag === BITS.QSIDE_CASTLE) {
                    castling_moves[color].queenside = move;
                }
            }
        });
    }

    function clear(keep_headers) {
        if (typeof keep_headers === 'undefined') {
            keep_headers = false
        }

        board = new Array(128)
        kings = { w: EMPTY, b: EMPTY }
        rooks = { w: [], b: [] }; // rooks dynamisch machen für Chess960
        castling_moves = {
            w: { kingside: null, queenside: null },
            b: { kingside: null, queenside: null },
        }; // Speichern der in  load() ermittelten Rochadezüge
        turn = WHITE
        castling = { w: 0, b: 0 }
        ep_square = EMPTY
        half_moves = 0
        move_number = 1
        history = []
        if (!keep_headers) header = {}
        comments = {}
        update_setup(generate_fen()) // PGN-Header anpassen
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


    function generate_chess960_position(id) {
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
        const fen = `${blackRank}/pppppppp/8/8/8/8/PPPPPPPP/${whiteRank} w ${castlingRights} - 0 1`;

        return fen;
    }

    /**
     * Lädt eine Stellung aus einer FEN-Zeichenkette.
     * Unterstützt Standard- und Chess960-FEN (X-FEN) und setzt interne Variablen.
     *
     * @param {string} fen - FEN-Zeichenkette der Stellung.
     * @param {boolean} [keep_headers=false] - Ob vorhandene Header beim Laden behalten werden.
     * @param {Object} [options={}] - Optionale Parameter.
     * @param {boolean} [options.chess960] - Erzwingt Chess960-Modus (überschreibt automatische Erkennung).
     * @returns {boolean} true bei erfolgreichem Laden, sonst false.
     */
    function load(fen, keep_headers, options = {}) {
        if (typeof keep_headers === 'undefined') {
            keep_headers = false;
        }

        // Optionaler Chess960-Flag aus options oder FEN-Castling-Erkennung
        if (options.hasOwnProperty('chess960')) {
            isChess960 = !!options.chess960;
        } else {
            isChess960 = false; // fallback
        }

        const tokens = fen.trim().split(/\s+/);
        if (!validate_fen(fen).valid) {
            return false;
        }

        // Wenn nicht explizit Chess960, aber Rochaderechte im X-FEN Format (Buchstaben statt KQkq), dann aktivieren
        if (!isChess960 && /^[A-Ha-h]{1,4}$/.test(tokens[2])) {
            isChess960 = true;
        }

        const position = tokens[0];
        let square = 0;

        clear(keep_headers);

        // Startaufstellung entsprechend FEN setzen
        for (let i = 0; i < position.length; i++) {
            const piece = position.charAt(i);
            if (piece === '/') {
                square += 8;
            } else if (is_digit(piece)) {
                square += parseInt(piece, 10);
            } else {
                const color = piece < 'a' ? WHITE : BLACK;
                put({ type: piece.toLowerCase(), color }, algebraic(square));
                square++;
            }
        }

        turn = tokens[1];
        castling = { w: 0, b: 0 }; // reset

        // Felder der Türme feststellen - muss vor dem Setzen der Rochade-Rechte passieren
        update_rooks();

        const cr = tokens[2];
        // Castling-Rechte setzen entsprechend der Position der Türme zum König
        if (isChess960 && /^[A-Ha-h]{1,4}$/.test(cr)) {
            ['w', 'b'].forEach(color => {
                for (let i = 0; i < cr.length; i++) {
                    const c = cr.charAt(i);
                    const isUpper = c === c.toUpperCase();
                    const isWhite = color === 'w';

                    // Skip if Farbe nicht passend
                    if ((isWhite && !isUpper) || (!isWhite && isUpper)) continue;

                    // Stelle sicher, dass es überhaupt rooks gibt
                    for (const rook of rooks[color]) {
                        const file = rook.square % 16; // 0-7 für a–h
                        const fileChar = 'abcdefgh'.charAt(file);
                        if (fileChar === c.toLowerCase()) {
                            castling[color] |= rook.flag; // BITS.KSIDE_CASTLE oder BITS.QSIDE_CASTLE
                        }
                    }
                }
            });
        } else {
            // Klassische KQkq
            if (cr.indexOf('K') > -1) castling.w |= BITS.KSIDE_CASTLE;
            if (cr.indexOf('Q') > -1) castling.w |= BITS.QSIDE_CASTLE;
            if (cr.indexOf('k') > -1) castling.b |= BITS.KSIDE_CASTLE;
            if (cr.indexOf('q') > -1) castling.b |= BITS.QSIDE_CASTLE;
        }

        ep_square = tokens[3] === '-' ? EMPTY : SQUARE_MAP[tokens[3]];
        half_moves = parseInt(tokens[4], 10);
        move_number = parseInt(tokens[5], 10);

        // Rochade-Züge ermitteln und speichern
        prepare_castling_moves();
        // PGN-Header-Tags an Aufstellung anpassen (SetUp, FEN, Variant)
        update_setup(generate_fen());

        return true;
    }

    /**
     * Validiert einen FEN-String inklusive Chess960-spezifischer Aspekte.
     * Prüft Struktur, korrekte Anzahl und Position der Figuren, Rochaderechte, Zugrecht und En-Passant-Feld.
     *
     * @param {string} fen - Der zu validierende FEN-String.
     * @returns {object} Objekt mit { valid: boolean, error_number: number, error: string }.
     */
    function validate_fen(fen) {
        const errors = {
            0: 'No errors.',
            1: 'FEN must contain six space-delimited fields.',
            2: 'Move number must be a positive integer.',
            3: 'Half move clock must be a non-negative integer.',
            4: 'En-passant square is invalid.',
            5: 'Castling availability is invalid.',
            6: 'Side to move must be "w" or "b".',
            7: 'Piece placement must contain 8 rows.',
            8: 'Invalid consecutive numbers in piece placement.',
            9: 'Invalid piece symbol in piece placement.',
            10: 'Row does not sum to 8 squares.',
            11: 'Illegal en-passant square for current side.',
            12: 'King missing or multiple kings found for a side.',
            13: 'Invalid castling rights for the position.'
        };

        const tokens = fen.trim().split(/\s+/);
        if (tokens.length !== 6) {
            return { valid: false, error_number: 1, error: errors[1] };
        }

        const [piecePlacement, activeColor, castlingRights, epSquare, halfMoveClock, moveNumber] = tokens;

        // Validate move number
        const moveNumInt = parseInt(moveNumber, 10);
        if (isNaN(moveNumInt) || moveNumInt <= 0) {
            return { valid: false, error_number: 2, error: errors[2] };
        }

        // Validate half-move clock
        const halfMoveInt = parseInt(halfMoveClock, 10);
        if (isNaN(halfMoveInt) || halfMoveInt < 0) {
            return { valid: false, error_number: 3, error: errors[3] };
        }

        // Validate en passant
        if (!/^(-|[abcdefgh][36])$/.test(epSquare)) {
            return { valid: false, error_number: 4, error: errors[4] };
        }

        // Validate side to move
        if (!/^[wb]$/.test(activeColor)) {
            return { valid: false, error_number: 6, error: errors[6] };
        }

        // Validate piece placement rows
        const rows = piecePlacement.split('/');
        if (rows.length !== 8) {
            return { valid: false, error_number: 7, error: errors[7] };
        }

        const validPieces = /^[prnbqkPRNBQK0-8]+$/;
        let whiteKingCount = 0, blackKingCount = 0;

        for (let i = 0; i < 8; i++) {
            const row = rows[i];
            if (!validPieces.test(row)) {
                return { valid: false, error_number: 9, error: errors[9] };
            }

            let sumSquares = 0;
            let previousWasNumber = false;
            for (const ch of row) {
                if (/\d/.test(ch)) {
                    if (previousWasNumber) {
                        return { valid: false, error_number: 8, error: errors[8] };
                    }
                    sumSquares += parseInt(ch, 10);
                    previousWasNumber = true;
                } else {
                    sumSquares += 1;
                    previousWasNumber = false;
                    if (ch === 'K') whiteKingCount++;
                    if (ch === 'k') blackKingCount++;
                }
            }
            if (sumSquares !== 8) {
                return { valid: false, error_number: 10, error: errors[10] };
            }
        }

        // Validate kings presence
        if (whiteKingCount !== 1 || blackKingCount !== 1) {
            return { valid: false, error_number: 12, error: errors[12] };
        }

        // Validate castling rights format (Chess960 allows A-H, a-h)
        if (!/^(-|[KQkqA-Ha-h]{1,8})$/.test(castlingRights)) {
            return { valid: false, error_number: 5, error: errors[5] };
        }

        // Validate legality of en passant square wrt active color
        if (
            (epSquare !== '-') &&
            (
                (epSquare[1] === '3' && activeColor === 'w') ||
                (epSquare[1] === '6' && activeColor === 'b')
            )
        ) {
            return { valid: false, error_number: 11, error: errors[11] };
        }

        return { valid: true, error_number: 0, error: errors[0] };
    }

    /**
     * Erzeugt die FEN-Zeichenkette für die aktuelle Brettstellung.
     * Berücksichtigt Chess960 und klassische Rochaderechte.
     * @returns {string} FEN-Zeichenkette der aktuellen Position inklusive Zugrecht,
     * Rochaderechte, en passant, Halbzähler und Zugnummer.
     */
    function generate_fen() {
        let empty = 0;
        let fen = '';

        // Durch alle Felder von a8 bis h1 iterieren (0x88 Board)
        for (let i = SQUARE_MAP.a8; i <= SQUARE_MAP.h1; i++) {
            if (board[i] == null) {
                empty++;
            } else {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                const color = board[i].color;
                const piece = board[i].type;

                fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
            }

            // Zeilenwechsel bei jedem 8. Feld
            if ((i + 1) & 0x88) {
                if (empty > 0) {
                    fen += empty;
                }
                if (i !== SQUARE_MAP.h1) {
                    fen += '/';
                }
                empty = 0;
                i += 8;
            }
        }

        let cflags = '';

        if (!isChess960) {
            // Klassisches FEN
            if (castling[WHITE] & BITS.KSIDE_CASTLE) cflags += 'K';
            if (castling[WHITE] & BITS.QSIDE_CASTLE) cflags += 'Q';
            if (castling[BLACK] & BITS.KSIDE_CASTLE) cflags += 'k';
            if (castling[BLACK] & BITS.QSIDE_CASTLE) cflags += 'q';
        } else {
            // X-FEN auf Basis von rooks[]
            ['w', 'b'].forEach(color => {
                const isUpper = color === 'w';

                if (castling[color] & BITS.QSIDE_CASTLE) {
                    const rook = rooks[color].find(r => r.flag === BITS.QSIDE_CASTLE);
                    if (rook) {
                        const file = rook.square % 16;
                        const letter = FILES[file];
                        cflags += isUpper ? letter.toUpperCase() : letter;
                    }
                }

                if (castling[color] & BITS.KSIDE_CASTLE) {
                    const rook = rooks[color].find(r => r.flag === BITS.KSIDE_CASTLE);
                    if (rook) {
                        const file = rook.square % 16;
                        const letter = FILES[file];
                        cflags += isUpper ? letter.toUpperCase() : letter;
                    }
                }

            });
        }

        if (cflags === '') {
            cflags = '-';
        }

        const epflags = ep_square === EMPTY ? '-' : algebraic(ep_square);

        return [fen, turn, cflags, epflags, half_moves, move_number].join(' ');
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
        if (history.length > 0) return;

        if (fen !== DEFAULT_POSITION) {
            header['SetUp'] = '1';
            header['FEN'] = fen;

            // Chess960 Variant setzen, wenn Flag aktiv
            if (isChess960) {
                header['Variant'] = 'Chess960';
            } else {
                delete header['Variant'];
            }
        } else {
            delete header['SetUp'];
            delete header['FEN'];
            delete header['Variant'];
        }
    }

    // ermittelt, welche Figur auf einem angegebenen Feld steht (leeres Feld = null)
    function get(square) {
        var piece = board[SQUARE_MAP[square]]
        return piece ? { type: piece.type, color: piece.color } : null
    }

    /* Setzt ein Piece-Objekt auf ein angegebenes Feld. Validiert Gültigkeit.
    * return bei Erfolg = true, Fehlschlag = false
    * Weder put() noch remove() aktualisieren die Turm-Positionen oder die Rochade-Züge!
    * Das findet momentan ausschließlich in der Initialisierung über die FEN statt.
    */
    function put(piece, square) {
        // 1. Validierung: Ist piece ein gültiges Objekt mit den Eigenschaften 'type' und 'color'?
        if (
            !piece ||                                 // null oder undefined?
            typeof piece !== 'object' ||              // kein Objekt?
            !('type' in piece) ||                     // fehlt 'type'?
            !('color' in piece)                       // fehlt 'color'?
        ) {
            console.warn("⚠️ put(): Ungültiges Piece übergeben:", piece, "auf Feld", square);
            return false;
        }

        // 2. Validierung: Ist der Piece-Typ ein erlaubtes Symbol (z. B. 'p', 'n', 'k')?
        if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
            console.warn("⚠️ put(): Ungültiger Piece-Typ:", piece.type);
            return false;
        }

        // 3. Validierung: Ist das Feld ein gültiger Eintrag im SQUARE_MAP (also z. B. 'e4')?
        if (!(square in SQUARE_MAP)) {
            console.warn("⚠️ put(): Ungültiges Feld:", square);
            return false;
        }

        // 4. Umwandlung: algebraisches Feld wie 'e4' → internes 0x88-Feldindex
        const sq = SQUARE_MAP[square];

        // 5. Spezialfall: Verhindere, dass mehr als ein König pro Farbe existiert
        if (
            piece.type === KING &&
            !(kings[piece.color] == EMPTY || kings[piece.color] == sq)
        ) {
            console.warn("⚠️ put(): Zweiter König entdeckt für Farbe", piece.color);
            return false;
        }

        // 6. Piece auf das Brett setzen
        board[sq] = { type: piece.type, color: piece.color };

        // 7. Falls König: Position in kings[] aktualisieren
        if (piece.type === KING) {
            kings[piece.color] = sq;
        }

        // 8. Setup aktualisieren (wird z. B. für FEN-Erzeugung gebraucht)
        update_setup(generate_fen()); // PGN-Header anpassen

        return true;
    }

    /* Entfernt eine Figur von einem Feld. */
    function remove(square) {
        var piece = get(square)
        board[SQUARE_MAP[square]] = null
        if (piece && piece.type === KING) {
            kings[piece.color] = EMPTY
        }

        update_setup(generate_fen()) // PGN-Header anpassen

        return piece
    }

    /**
     * Erzeugt ein Zugobjekt mit allen relevanten Metadaten für spätere Verarbeitung.
     * Beinhaltet Standardzüge sowie Spezialfälle wie Umwandlung und en-passant.
     *
     * @param {Array} board - Das aktuelle Spielfeld (Array mit Figurenobjekten oder null).
     * @param {number} from - Ursprungsfeld im 0x88-Indexformat.
     * @param {number} to - Zielfeld im 0x88-Indexformat.
     * @param {number} flags - Bitfeld mit Zugtyp-Informationen (z. B. normal, Capture, Promotion, Castling).
     * @param {string} [promotion] - Optionaler Umwandlungsfigurtyp ('q', 'r', 'b', 'n').
     *
     * @returns {Object} Das generierte Zugobjekt:
     *   {
     *     color: 'w' | 'b',
     *     from: number,
     *     to: number,
     *     flags: number,
     *     piece: string,
     *     promotion?: string,
     *     captured?: string
     *   }
     */
    function build_move(board, from, to, flags, promotion, meta = {}) {
        const move = {
            color: turn,
            from: from,
            to: to,
            flags: flags,
            piece: board[from].type,  // optional absichern
        };

        if (promotion) {
            move.flags |= BITS.PROMOTION
            move.promotion = promotion;
        }

        // Ergänze Rochade-Metadaten (Chess960 und Standard)
        if (meta && typeof meta === 'object') {
            if ('rook_from' in meta) move.rook_from = meta.rook_from;
            if ('rook_to' in meta) move.rook_to = meta.rook_to;
        }

        // Ergänzen, falls nicht übergeben
        if ((flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) &&
            (move.rook_from === undefined || move.rook_to === undefined)) {

            const side = (flags & BITS.KSIDE_CASTLE) !== 0 ? 'kingside' : 'queenside';
            const cmove = castling_moves[turn][side];

            if (cmove && cmove.rook_from !== undefined && cmove.rook_to !== undefined) {
                move.rook_from = cmove.rook_from;
                move.rook_to = cmove.rook_to;
            } else {
                // optional: Schutz vor inkonsistenten Daten
                console.warn("⚠️ castling_moves unvollständig oder fehlerhaft für Seite", side, castling_moves[turn]);
            }
        }

        if (flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
            if (typeof move.rook_from !== 'number' || typeof move.rook_to !== 'number') {
                console.warn("⚠️ Warnung: Rochade-Zug ohne rook_from/rook_to", move);
            }
        }

        // 🔐 Sicherstellen, dass captured IMMER korrekt gesetzt wird
        if (board[to]) {
            move.captured = board[to].type;
        } else if (flags & BITS.EP_CAPTURE) {
            move.captured = PAWN;
        }

        return move;
    }

    /**
     * Ermittelt die Felder zwischen angegebenen Feldern, z. B. für den Rochadeweg des Königs.
     * Chess960: Falls König und Turm nebeneinander stehen, wird [] zurückgegeben.
     * @param {*} from
     * @param {*} to
     * @returns
     */
    function squaresBetween(from, to) {
        const fileFrom = from.charCodeAt(0);
        const fileTo = to.charCodeAt(0);
        const rank = from.charAt(1);

        const min = Math.min(fileFrom, fileTo);
        const max = Math.max(fileFrom, fileTo);

        const squares = [];
        for (let f = min + 1; f < max; f++) {
            squares.push(String.fromCharCode(f) + rank);
        }
        return squares;
    }

    /* Felder zwischen König und Turm leer?
    * True, auch wenn in Chess960 benachbart!
    */
    function isEmptyBetween(king_from, king_to, rook_from) {
        const squares = squaresBetween(king_from, king_to);

        // Das Ziel-Feld des Königs
        const kingToPiece = get(king_to);

        const to_is_clear = (
            kingToPiece === null ||
            (rook_from === king_to && kingToPiece?.type === ROOK)
        );

        return squares.every(sq => get(sq) === null) && to_is_clear;
    }

    // Schachgebot auf dem Rochadeweg des Königs einschließlich Start- und Zielfeld?
    function isCheckOnPath(king_from, king_to, color) {
        const squares = [king_from, ...squaresBetween(king_from, king_to), king_to];
        return squares.some(sq => attacked(swap_color(color), sq));
    }

    /**
     * Legalität der Rochade prüfen
     * Chess960: Besonderheit - tauschen König und Turm die Felder?
     * @param {*} king_from
     * @param {*} king_to
     * @param {*} rook_from
     * @param {*} rook_to
     * @param {*} color
     * @returns
     */
    function iscastlinglegal(king_from, king_to, rook_from, rook_to, color) {
        const is_clear = isEmptyBetween(algebraic(king_from), algebraic(king_to), algebraic(rook_from));
        const is_safe = !isCheckOnPath(algebraic(king_from), algebraic(king_to), color);

        // Wenn der Weg inkl. Start und Ziel nicht frei ist -> false
        if (!is_clear || !is_safe) {
            return false;
        }

        // Turm und König tauschen die Felder? - Nur bei Chess960 erlaubt.
        if (king_from === rook_to && king_to === rook_from && !isChess960 ) {
            return false;
        }

        // wenn alles passt, ist die Rochade legal
        return true;
    }

    // Prüfung zugunsten der Lesbarkeit als function ausgegliedert.
    function is_castling(move) {
        return !!(move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE));
    }

    /**
     * Generiert alle (pseudo-)legalen Züge für die aktuelle Brettstellung.
     *
     * Diese Funktion berücksichtigt Standard-Schach und Chess960 (Rochade gemäß FIDE-Regeln),
     * inklusive Spezialregeln wie Bauernumwandlung, en-passant und Rochade.
     * Sie kann optional auf legale Züge oder ein einzelnes Feld/Zugtyp eingeschränkt werden.
     *
     * @param {Object} [options] - Optionales Filter-Objekt zur Eingrenzung der Zugerzeugung.
     * @param {boolean} [options.legal=true] - Ob nur legale Züge zurückgegeben werden sollen
     *     (d. h. solche, die den eigenen König nicht im Schach lassen).
     * @param {string} [options.square] - Optionales Feld (z. B. 'e2'), um Züge nur von diesem Feld zu generieren.
     * @param {string} [options.piece] - Optionaler Filter für Figurtypen (z. B. 'n', 'p', 'k'), nur diese Figuren erzeugen Züge.
     *
     * @returns {Array<Object>} Eine Liste von Zugobjekten mit Eigenschaften wie:
     *   - `from`: Startfeld (z. B. 'e2')
     *   - `to`: Zielfeld (z. B. 'e4')
     *   - `flags`: Bitmaske mit Zugtyp (normal, Rochade, Schlagfall, Promotion etc.)
     *   - `piece`: Der ziehende Figurtyp (z. B. 'p' für Bauer)
     *   - `color`: 'w' oder 'b'
     *   - `captured` (optional): Falls es ein Schlagzug ist
     *   - `promotion` (optional): Falls es eine Umwandlung ist
     *
     * Besondere Hinweise:
     * - Rochade funktioniert korrekt auch bei Chess960, sofern `get_castling_move()` korrekt konfiguriert ist.
     * - Bei `options.legal = false` sind auch Züge enthalten, bei denen der König im Schach stünde.
     * - Die Funktion verwendet das interne 0x88-Brettlayout.
     */
    function generate_moves(options) {
        function add_move(board, moves, from, to, flags, promotion = undefined, meta = {}) {
            /* pawn promotion */
            if (
                board[from].type === PAWN &&
                (rank(to) === RANK_8 || rank(to) === RANK_1)
            ) {
                var pieces = [QUEEN, ROOK, BISHOP, KNIGHT];
                for (var i = 0; i < pieces.length; i++) {
                    moves.push(build_move(board, from, to, flags, pieces[i], meta));
                }
            } else {
                moves.push(build_move(board, from, to, flags, promotion, meta));
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
         * Chess960-Version
         */
        if (piece_type === true || piece_type === KING) {
            if (!single_square || last_sq === kings[us]) {
                const cmoves = castling_moves[us];

                const castlingTypes = [
                    [BITS.KSIDE_CASTLE, cmoves.kingside],
                    [BITS.QSIDE_CASTLE, cmoves.queenside],
                ];

                for (const [flag, move] of castlingTypes) {
                    if (!(castling[us] & flag)) continue;
                    if (!move) continue;

                    const { king_from, king_to, rook_from, rook_to } = move;
                    const is_castling_legal = iscastlinglegal(king_from, king_to, rook_from, rook_to, us);

                    // Zug nur hinzufügen, wenn Rochade erlaubt ist.
                    if (is_castling_legal) {
                        add_move(
                            board,
                            moves,
                            king_from,
                            king_to,
                            flag,
                            null,
                            { rook_from, rook_to }
                        );
                    }
                }
            }
        }

        /* return all pseudo-legal moves (this includes moves that allow the king
         * to be captured)
         * (Da habe ich leise Zweifel. Auch der Originalcode machte eine Prüfung der Rochade-Legalität.)
         */
        if (!legal) {
            return moves
        }

        /* filter out illegal moves */
        var legal_moves = []
        for (var i = 0, len = moves.length; i < len; i++) {
            make_move(moves[i]);
            if (!king_attacked(us)) {
                legal_moves.push(moves[i])
            }
            undo_move();
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

        // zusätzliche Prüfung aus Debugging-Gründen.
        if (!move || typeof move.from === 'undefined' || !board[move.from]) {
            console.warn("⚠️ Ungültiger Zug in chess.mjs.move_to_san()", move);
            return "?";
        }

        if (is_castling(move)) {
            // Bestimme die Grundreihe des ziehenden Königs aus dem Ursprungsfeld
            const r = rank(move.from); // 7 = Weiß (1. Reihe), 0 = Schwarz (8. Reihe)

            // Ziel-Felder für Rochade sind immer gleich, unabhängig vom Startfeld
            const kingside_target = SQUARE_MAP['g' + (8 - r)]; // g1 oder g8
            const queenside_target = SQUARE_MAP['c' + (8 - r)]; // c1 oder c8

            if (move.to === kingside_target) {
                output = 'O-O';
            } else if (move.to === queenside_target) {
                output = 'O-O-O';
            }
        }   else {
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

    /* Ermittelt, ob ein Feld durch eine gegnerische Figur (color) angegriffen wird */
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

    // prüft, ob der eigene König angegriffen wird. attacked() erwartet die gegnerische Farbe als Aufrufparameter.
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

    // Chess960: Erweitert um rooks[]
    function push(move) {
        history.push({
            move: move,
            kings: { b: kings.b, w: kings.w },
            turn: turn,
            castling: { b: castling.b, w: castling.w },
            ep_square: ep_square,
            half_moves: half_moves,
            move_number: move_number,
            rooks: {
                b: rooks.b.map(r => ({ square: r.square, flag: r.flag })),
                w: rooks.w.map(r => ({ square: r.square, flag: r.flag })),
            },
        })
    }

    /**
     * Führt einen Zug auf dem internen Brett aus, inklusive Spezialfälle wie
     * Rochade, En-passant und Umwandlung. Aktualisiert alle relevanten Spielzustände
     * wie Brettposition, Zugrecht, Rochaderechte, en-passant-Feld, 50-Züge-Regel und Zugnummer.
     *
     * @param {Object} move - Der auszuführende Zug. Erwartete Struktur:
     *   {
     *     from: number,             // Ausgangsfeld (0x88-Index)
     *     to: number,               // Zielfeld (0x88-Index)
     *     piece: string,            // Figurentyp ('p', 'n', 'b', 'r', 'q', 'k')
     *     promotion?: string,       // Falls Umwandlung: neuer Figurentyp
     *     flags: number,            // Bitfeld mit Zugtypen (z.B. Rochade, en-passant)
     *     rook_from?: string,       // Nur bei Rochade: Ursprungsfeld des Turms (z.B. "h1")
     *     rook_to?: string          // Nur bei Rochade: Zielfeld des Turms (z.B. "f1")
     *   }
     *
     * @returns {void}
     *
     * Chess960: Anpassungen für Rochade, insbesondere, wenn König und Turm nebeneinander stehen
     */
    function make_move(move) {
        var us = turn;
        var them = swap_color(us);

        let moving_piece = board[move.from];

        // Zughistorie sichern (für Undo)
        push(move);

        // Rochade ausführen
        if (moving_piece.type === KING && is_castling(move)) {
            // Versuche zuerst, Rochade-Metadaten zu nutzen
            let rook_from = move.rook_from;
            let rook_to = move.rook_to;

            if (typeof rook_from !== 'number' || typeof rook_to !== 'number') {
                const kingside = (move.flags & BITS.KSIDE_CASTLE) !== 0;
                const cmove = castling_moves[us][kingside ? 'kingside' : 'queenside'];

                if (cmove && typeof cmove.rook_from === 'number' && typeof cmove.rook_to === 'number') {
                    rook_from = cmove.rook_from;
                    rook_to = cmove.rook_to;
                } else {
                    console.warn("⚠️ castling_moves fallback fehlt in make_move", { us, kingside, castling_moves });
                }
            }

            const is_castling_legal = iscastlinglegal(move.from, move.to, rook_from, rook_to, us);

            if (is_castling_legal) {
                const rook_piece = board[rook_from];

                if (rook_piece && rook_piece.type === ROOK && rook_piece.color === us) {
                    board[move.from] = null;
                    board[rook_from] = null;
                    board[move.to] = moving_piece;
                    board[rook_to] = rook_piece;
                } else {
                    console.warn("⚠️ Ungültiger Turm bei Rochade:", { rook_from, rook_piece });
                }
            }

        } else {
            // König (ohne Rochade) oder andere Figur bewegen
            board[move.to] = moving_piece;
            board[move.from] = null;
        }

        // König versetzt → Rochaderechte entfernen & Königslage aktualisieren
        if (moving_piece && moving_piece.type === KING) {
            kings[us] = move.to;
            castling[us] = 0;
        }

        // En-passant-Schlag entfernen
        if (move.flags & BITS.EP_CAPTURE) {
            var ep_captured = us === WHITE ? move.to + 16 : move.to - 16;
            board[ep_captured] = null;
        }

        // Bauernumwandlung behandeln
        if (move.flags & BITS.PROMOTION) {
            board[move.to] = { type: move.promotion, color: us };
        }

        // Rochaderechte verlieren beim Bewegen eines Turms
        if (castling[us]) {
            for (var i = 0, len = rooks[us].length; i < len; i++) {
                if (
                    move.from === rooks[us][i].square &&
                    castling[us] & rooks[us][i].flag
                ) {
                    castling[us] ^= rooks[us][i].flag;
                    break;
                }
            }
        }

        // Rochaderechte verlieren beim Schlagen eines gegnerischen Turms
        if (castling[them]) {
            for (var i = 0, len = rooks[them].length; i < len; i++) {
                if (
                    move.to === rooks[them][i].square &&
                    castling[them] & rooks[them][i].flag
                ) {
                    castling[them] ^= rooks[them][i].flag;
                    break;
                }
            }
        }

        // En-passant-Ziel setzen (nur bei Doppelschritt)
        if (move.flags & BITS.BIG_PAWN) {
            ep_square = us === BLACK ? move.to - 16 : move.to + 16;
        } else {
            ep_square = EMPTY;
        }

        // 50-Zug-Regel: Zähler zurücksetzen bei Bauernzug oder Schlag
        if (move.piece === PAWN || move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
            half_moves = 0;
        } else {
            half_moves++;
        }

        // Zugnummer erhöhen nach Schwarz-Zug
        if (us === BLACK) {
            move_number++;
        }

        //update_rooks(); // wichtig für zukünftige Rochaderechte
        //prepare_castling_moves();

        // Spielerwechsel
        turn = them;
    }

    /* Nimmt einen Zug zurück und stellt die vorherige Brettposition wieder her */
    function undo_move() {
        const old = history.pop();
        if (!old) return null;

        const move = old.move;
        kings = old.kings;
        turn = old.turn;
        castling = old.castling;
        ep_square = old.ep_square;
        half_moves = old.half_moves;
        move_number = old.move_number;
        rooks = {
            w: old.rooks.w.map(r => ({ square: r.square, flag: r.flag })),
            b: old.rooks.b.map(r => ({ square: r.square, flag: r.flag })),
        };

        const us = turn;
        const them = swap_color(turn);

        // Rochade rückgängig machen, berücksichtigt Chess960
        if (is_castling(move)) {
            if (typeof move.rook_from === 'number' && typeof move.rook_to === 'number') {
                board[move.to] = null;
                board[move.rook_to] = null;
                board[move.rook_from] = { type: ROOK, color: us };
                board[move.from] = { type: KING, color: us };
            } else {
                console.warn("⚠️ Rochadedaten fehlen", move);
            }
        } else {
            // König (ohne Rochadezüge) oder andere bewegte Figur rückversetzen
            const piece_type = (move.flags & BITS.PROMOTION) ? PAWN : move.piece;
            board[move.from] = { type: piece_type, color: us };
            board[move.to] = null; // Feld räumen (z. B. Königsziel)
        }

        // Geschlagene Figur wiederherstellen
        if (move.flags & BITS.CAPTURE) {
            board[move.to] = { type: move.captured, color: them };
        } else if (move.flags & BITS.EP_CAPTURE) {
            const index = us === BLACK ? move.to - 16 : move.to + 16;
            board[index] = { type: PAWN, color: them };
        }

        //update_rooks();
        //prepare_castling_moves();
        return move;
    }

    // Chess960: Hilfsfunktion für move_from_san
    function complete_move(legal) {
        // Ergänze Chess960 Rochade-Metadaten, falls nötig
        if ((legal.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) &&
            (legal.rook_from === undefined || legal.rook_to === undefined)) {

            const side = (legal.flags & BITS.KSIDE_CASTLE) !== 0 ? 'kingside' : 'queenside';
            const cmove = castling_moves[legal.color]?.[side];

            if (cmove && typeof cmove.rook_from === 'number' && typeof cmove.rook_to === 'number') {
                legal.rook_from = cmove.rook_from;
                legal.rook_to = cmove.rook_to;
            } else {
                console.warn("⚠️ castling_moves unvollständig bei Legalitätsprüfung", {
                    color: legal.color,
                    side,
                    flags: legal.flags,
                    cmove,
                });
            }
        }

        // Ergänze captured (z. B. für En Passant)
        if (typeof legal.captured === 'undefined') {
            if (board[legal.to]) {
                legal.captured = board[legal.to].type;
            } else if (legal.flags & BITS.EP_CAPTURE) {
                legal.captured = PAWN;
            }
        }

        return legal;
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
                            return complete_move(moves[i])
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
                                return complete_move(moves[i])
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
                                    return complete_move(moves[i])
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

    /* Getter, ob Chess960 gespielt wird */
    function isVariantChess960() {
        return isChess960;
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

        // Chess960:
        isVariantChess960: function() {
            return isVariantChess960()
        },

        load: function (fen) {
            return load(fen)
        },

        reset: function () {
            return reset()
        },

        generate_chess960_position: function(index) {
            return generate_chess960_position(index)
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

// Chess960 ergänzt:
export {
    Chess,
    generateStartPositionFEN,
    decodeChess960IdFromFEN
}