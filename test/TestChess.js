/**
 * @author Stefan Haack (https://shaack.com)
 */
import {describe, it, assert} from "teevi/src/teevi.js"
import {Chess, WHITE, BLACK} from "../src/Chess.js"

describe("chess.mjs unit tests", function () {

    it("should create empty Chess", () => {
        const chess = new Chess()
        assert.equal(chess.history().length, 0)
        assert.equal(Object.keys(chess.header()).length, 0)
        assert.equal(chess.fen(), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    })

    it("should load a game from FEN", function () {
        const fen = "4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1"
        const chess = new Chess(fen)
        assert.equal(chess.header().FEN, fen)
        assert.equal(chess.fen(), fen)
        assert.equal(chess.get("e1").type, "k")
        assert.equal(chess.get("e1").color, "w")
    })

    it("should load a PGN with SetUp and FEN and continue moves", function () {
        const pgn = `[SetUp "1"]
[FEN "4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1"]

1. e4 (1. d4 {Die Variante} d5) e5 {Ein Kommentar} 2. a3`
        const chess = new Chess()
        assert.equal(chess.load_pgn(pgn), true)
        assert.equal(chess.move("Nc6"), null)
        chess.move("h6")
        assert.equal(chess.fen(), "4k3/pppp1pp1/7p/4p3/4P3/P7/1PPP1PPP/4K3 w - - 0 3")
    })

    it("should load a PGN", function () {
        const chess = new Chess()
        const pgn = `[Event "IBM Kasparov vs. Deep Blue Rematch"]
[Site "New York, NY USA"]
[Date "1997.05.11"]
[Round "6"]
[White "Deep Blue"]
[Black "Kasparov, Garry"]
[Opening "Caro-Kann: 4...Nd7"]
[ECO "B17"]
[Result "1-0"]

1.e4 c6 2.d4 d5 3.Nc3 dxe4 4.Nxe4 Nd7 5.Ng5 Ngf6 6.Bd3 e6 7.N1f3 h6
8.Nxe6 Qe7 9.O-O fxe6 10.Bg6+ Kd8 {Kasparov schüttelt kurz den Kopf}
11.Bf4 b5 12.a4 Bb7 13.Re1 Nd5 14.Bg3 Kc8 15.axb5 cxb5 16.Qd3 Bc6
17.Bf5 exf5 18.Rxe7 Bxe7 19.c4 1-0`
        assert.equal(chess.load_pgn(pgn), true)
        assert.equal(chess.history().length, 37)
        assert.equal(chess.header().White, "Deep Blue")
        const firstMove = chess.history({verbose:true})[0]
        assert.equal(firstMove.color, "w")
        assert.equal(firstMove.san, "e4")
        assert.equal(chess.pgn().includes("Kasparov schüttelt kurz den Kopf"), true)
    })

    it("should load a PGN with SetUp", () => {
        const pgn = `[Event "?"]
[White "?"]
[Black "?"]
[Result "0-1"]
[SetUp "1"]
[FEN "5rk1/2nb1p1p/1p4p1/p2p2P1/1p2qP1P/1P2P3/P1Q1NK2/1B5R w - - 0 1"]

1. Qc1 Qe6 2. Qxc7 
0-1`
        const chess = new Chess()
        assert.equal(chess.load_pgn(pgn), true)
        assert.equal(chess.history({verbose:true})[2].san, "Qxc7")
    })

    it('should parse stappenmethode weekly.pgn headers', () => {
        const chess = new Chess()
        const pgn = `[Event "?"]
[Site "?"]
[Date "2012.??.??"]
[Round "?"]
[White "Schaak opheffen"]
[Black "Materiaal"]
[Result "0-1"]
[Annotator "S3"]
[Annotator "app 037-1"]
[SetUp "1"]
[FEN "r1b1Q1k1/1p2bpqp/8/8/p1Pr4/4PpN1/P6P/R4RK1 b - - 0 1"]

1... Bf8 (1... Qf8? 2. Qxf8+ Bxf8 3. exd4) 2. exd4 Qxd4+ {%Q} 3. Kh1 Bh3 
0-1`
        assert.equal(chess.load_pgn(pgn), true)
        assert.equal(chess.header().White, "Schaak opheffen")
        assert.equal(chess.header().Annotator, "app 037-1")
    })

    it('should allow basic traversal checks', () => {
        const chess = new Chess()
        const pgn = `[SetUp "1"]
[FEN "8/8/b2Bq3/7Q/3kp3/5pP1/8/3K4 w - - 0 1"]
[Result "1-0"]

1. Qc5+ Kd3 2. Qc2+ Kd4 3. Qd2+ Bd3 4. Qe3+ Kxe3 (4... Kc3 5. Qc1+ Kb3 6. Qa3+ Kc4 7. Qb4+ Kd5 8. Qc5#) 5. Bc5# 
1-0`
        assert.equal(chess.load_pgn(pgn), true)
        const firstMove = chess.history({verbose:true})[0]
        assert.equal(firstMove.san, "Qc5+")
        const lastMove = chess.history({verbose:true}).pop()
        assert.equal(lastMove.san, "Bc5#")
        assert.equal(chess.game_over(), true)
        assert.equal(chess.in_checkmate(), true)
        assert.equal(chess.in_draw(), false)
        assert.equal(chess.pgn().includes("1. Qc5+ Kd3 2. Qc2+"), true)
    })

    it('should add move at the end of the history', () => {
        const chess = new Chess()
        assert.equal(chess.turn(), WHITE)
        chess.move("e4")
        assert.equal(chess.turn(), BLACK)
        assert.equal(chess.history({verbose:true})[0].san, "e4")
        chess.move("e5")
        assert.equal(chess.turn(), WHITE)
    })

    it('should provide correct turn after loading a FEN', () => {
        const chess = new Chess()
        chess.load('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
        assert.equal(chess.turn(), BLACK)
    })

    it('invalid move should return `null`', () => {
        const chess = new Chess()
        chess.load('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
        assert.equal(chess.turn(), BLACK)
        const move = chess.move("a1")
        assert.equal(move, null)
    })

    it('should report pieces via board()', () => {
        const chess = new Chess()
        const all = chess.board().flat().filter(Boolean)
        assert.equal(all.length, 32)
        const kings = all.filter(p => p.type === 'k')
        assert.equal(kings.length, 2)
    })

    it('should undo last move', () => {
        const chess = new Chess()
        const pgn = `[SetUp "1"]
[FEN "8/8/b2Bq3/7Q/3kp3/5pP1/8/3K4 w - - 0 1"]

1. Qc5+ Kd3 2. Qc2+ Kd4 3. Qd2+ Bd3 4. Qe3+ Kxe3 (4... Kc3 5. Qc1+ Kb3 6. Qa3+ Kc4 7. Qb4+ Kd5 8. Qc5#) 5. Bc5# 
1-0`
        chess.load_pgn(pgn)
        assert.equal(chess.history().length, 9)
        chess.undo()
        assert.equal(chess.history().length, 8)
    })

    it("should not load incorrect FEN", function () {
        const fen = "4k3/pppppppp/8/8/8/8/PPPPPP/4K3 w - - 0 1"
        const chess = new Chess()
        assert.equal(chess.validate_fen(fen).valid, false)
        assert.equal(chess.load(fen), false)
    })

    it("should load different FENs and then work correctly", function () {
        const fen = "ppppkppp/pppppppp/pppppppp/pppppppp/8/8/8/RNBQKBNR w KQ - 0 1"
        const chess = new Chess()
        assert.equal(chess.load(fen), true)
        assert.true(chess.move("e4") === null)
        assert.true(chess.move("Ke2") !== null)
        assert.equal(chess.load('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'), true)
        assert.true(!!chess.move("e4"))
    })

    it("should make a move with sloppy SAN", function () {
        let chess = new Chess("r1R2r1k/1R6/1P2B2p/4pPp1/4N1P1/7P/5P2/2R3K1 w - - 1 44")
        let result = chess.move("R8c7")
        assert.true(result !== null)
        chess = new Chess("r1R2r1k/1R6/1P2B2p/4pPp1/4N1P1/7P/5P2/2R3K1 w - - 1 44")
        result = chess.move("Rc8c7")
        assert.true(result == null)
        chess = new Chess("r1R2r1k/1R6/1P2B2p/4pPp1/4N1P1/7P/5P2/2R3K1 w - - 1 44")
        result = chess.move("Rc8-c7")
        assert.true(result == null)
        chess = new Chess("r1R2r1k/1R6/1P2B2p/4pPp1/4N1P1/7P/5P2/2R3K1 w - - 1 44")
        result = chess.move("Rc8-c7", {sloppy:true})
        assert.true(result != null)
        chess = new Chess("r1R2r1k/1R6/1P2B2p/4pPp1/4N1P1/7P/5P2/2R3K1 w - - 1 44")
        result = chess.move("Rc8c7", {sloppy:true})
        assert.true(result != null)
    })

    it("should load non standard PGNs and then work correctly", function () {
        const fen = "ppppkppp/pppppppp/pppppppp/pppppppp/8/8/8/RNBQKBNR w KQ - 0 1"
        const chess = new Chess(fen)
        assert.true(chess.move("e4") === null)
        assert.true(chess.move("Ke2") !== null)
        chess.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
        assert.true(chess.move("e4"))
    })

})
