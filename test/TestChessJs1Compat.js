/**
 * @author Stefan Haack (https://shaack.com)
 *
 * The camelCase aliases for code written against chess.js 1.x.
 */
import {describe, it, assert} from "teevi/src/teevi.js"
import {Chess} from "../src/Chess.js"

describe("TestChessJs1Compat", function () {

    it("should alias the game state methods", () => {
        const chess = new Chess()
        assert.equal(chess.isCheck(), chess.in_check())
        assert.equal(chess.isCheckmate(), chess.in_checkmate())
        assert.equal(chess.isStalemate(), chess.in_stalemate())
        assert.equal(chess.isDraw(), chess.in_draw())
        assert.equal(chess.isInsufficientMaterial(), chess.insufficient_material())
        assert.equal(chess.isThreefoldRepetition(), chess.in_threefold_repetition())
        assert.equal(chess.isGameOver(), chess.game_over())
        assert.false(chess.isGameOver())
        // fool's mate
        chess.loadPgn("1. f3 e5 2. g4 Qh4#")
        assert.true(chess.isCheck())
        assert.true(chess.isCheckmate())
        assert.true(chess.isGameOver())
        assert.false(chess.isDraw())
    })

    it("should detect stalemate and draws through the aliases", () => {
        assert.true(new Chess("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1").isStalemate())
        assert.true(new Chess("4k3/8/8/8/8/8/8/4K3 w - - 0 1").isInsufficientMaterial())
        const fifty = new Chess("4k3/8/8/8/8/8/8/4K2R w - - 100 60")
        assert.true(fifty.isDrawByFiftyMoves())
        assert.true(fifty.isDraw())
        assert.false(new Chess().isDrawByFiftyMoves())
        const repetition = new Chess()
        for (const san of ["Nf3", "Nf6", "Ng1", "Ng8", "Nf3", "Nf6", "Ng1", "Ng8"]) {
            repetition.move(san)
        }
        assert.true(repetition.isThreefoldRepetition())
    })

    it("should provide moveNumber() and isAttacked()", () => {
        const chess = new Chess()
        assert.equal(chess.moveNumber(), 1)
        chess.move("e4")
        chess.move("e5")
        assert.equal(chess.moveNumber(), 2)
        assert.true(chess.isAttacked("d5", "w"))   // pawn e4 attacks d5
        assert.true(chess.isAttacked("d4", "b"))   // pawn e5 attacks d4
        assert.false(chess.isAttacked("e5", "b"))  // no black piece attacks its own pawn's square
        assert.false(chess.isAttacked("a4", "b"))
        assert.false(chess.isAttacked("z9", "w"))
        // sliding and jumping pieces, and the king
        const pieces = new Chess("4k3/8/8/8/8/5n2/8/B3K2R w K - 0 1")
        assert.true(pieces.isAttacked("h8", "w"))   // bishop a1 along the long diagonal
        assert.true(pieces.isAttacked("h7", "w"))   // rook h1 along the file
        assert.true(pieces.isAttacked("e2", "w"))   // king e1
        assert.false(pieces.isAttacked("b1", "w"))  // rook h1 is blocked by the king on e1
        assert.true(pieces.isAttacked("e1", "b"))   // knight f3 gives check
        assert.true(pieces.isAttacked("d2", "b"))   // knight f3
        assert.false(pieces.isAttacked("a1", "b"))
    })

    it("should alias loadPgn() and accept strict and newlineChar", () => {
        const chess = new Chess()
        assert.true(chess.loadPgn("1. e4 e5 2. Nf3 Nc6 3. Bb5", {strict: true}))
        assert.equal(chess.fen(), "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3")
        // long algebraic notation only parses when not strict
        assert.false(new Chess().loadPgn("1. e2e4 e7e5", {strict: true}))
        assert.true(new Chess().loadPgn("1. e2e4 e7e5", {strict: false}))
        const withHeader = new Chess()
        assert.true(withHeader.loadPgn('[White "A"]<br>[Black "B"]<br><br>1. e4 e5', {newlineChar: "<br>"}))
        assert.equal(withHeader.getHeaders().White, "A")
    })

    it("should accept strict in move()", () => {
        const chess = new Chess()
        assert.equal(chess.move("e2e4", {strict: true}), null)
        assert.equal(chess.move("e4", {strict: true}).san, "e4")   // proper SAN passes strict parsing
        assert.equal(chess.move("e7e5", {strict: false}).san, "e5")
        // sloppy keeps working and wins over strict when both are given
        assert.equal(chess.move("g1f3", {sloppy: true, strict: true}).san, "Nf3")
        assert.equal(chess.move("g8f6", {sloppy: false, strict: false}), null)
    })

    it("should prefer the old option spelling in load_pgn() when both are given", () => {
        assert.true(new Chess().loadPgn("1. e2e4 e7e5", {sloppy: true, strict: true}))
        assert.false(new Chess().loadPgn("1. e2e4 e7e5", {sloppy: false, strict: false}))
        const chess = new Chess()
        assert.true(chess.loadPgn('[White "A"]<br><br>1. e4', {newline_char: "<br>", newlineChar: "\n"}))
        assert.equal(chess.getHeaders().White, "A")
    })

    it("should accept maxWidth and newline in pgn()", () => {
        const chess = new Chess()
        chess.loadPgn("1. e4 e5 2. Nf3 Nc6 3. Bb5")
        assert.equal(chess.pgn({maxWidth: 10, newline: "|"}), "1. e4 e5|2. Nf3 Nc6|3. Bb5")
        assert.equal(chess.pgn({maxWidth: 10, newline: "|"}), chess.pgn({max_width: 10, newline_char: "|"}))
        // the old spelling wins when both are given
        assert.equal(chess.pgn({max_width: 10, maxWidth: 0, newline_char: "|", newline: "#"}), "1. e4 e5|2. Nf3 Nc6|3. Bb5")
        // newline is also used between header lines
        chess.setHeader("White", "A")
        chess.setHeader("Black", "B")
        assert.true(chess.pgn({newline: "|"}).startsWith('[White "A"]|[Black "B"]||'))
    })

    it("should return the chess.js 1.x shape from validateFen()", () => {
        const chess = new Chess()
        const ok = chess.validateFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
        assert.true(ok.ok)
        assert.equal(ok.error, undefined)
        const bad = chess.validateFen("not a fen")
        assert.false(bad.ok)
        assert.equal(bad.error, "FEN string must contain six space-delimited fields.")
    })

    it("should alias squareColor()", () => {
        const chess = new Chess()
        assert.equal(chess.squareColor("a1"), "dark")
        assert.equal(chess.squareColor("h1"), "light")
        assert.equal(chess.squareColor("z9"), null)
    })

    it("should alias the comment methods", () => {
        const chess = new Chess()
        chess.move("e4")
        chess.setComment("king's pawn")
        assert.equal(chess.getComment(), "king's pawn")
        assert.equal(chess.getComments().length, 1)
        assert.equal(chess.getComments()[0].comment, "king's pawn")
        assert.equal(chess.removeComment(), "king's pawn")
        assert.equal(chess.getComment(), undefined)
        chess.setComment("again")
        assert.equal(chess.deleteComment(), "again")
        chess.setComment("a")
        chess.move("e5")
        chess.setComment("b")
        assert.equal(chess.removeComments().length, 2)
        assert.equal(chess.getComments().length, 0)
        chess.setComment("c")
        assert.equal(chess.deleteComments().length, 1)
    })

    it("should provide setHeader(), getHeaders() and removeHeader()", () => {
        const chess = new Chess()
        chess.setHeader("White", "Anand")
        chess.setHeader("Black", "Carlsen")
        const headers = chess.getHeaders()
        assert.equal(headers.White, "Anand")
        assert.equal(headers.Black, "Carlsen")
        // getHeaders() returns a copy
        headers.White = "changed"
        assert.equal(chess.getHeaders().White, "Anand")
        assert.equal(chess.header().White, "Anand")
        assert.true(chess.removeHeader("White"))
        assert.false(chess.removeHeader("White"))
        assert.equal(chess.getHeaders().White, undefined)
        assert.true(chess.pgn().startsWith('[Black "Carlsen"]'))
    })

    it("should work in Chess960 mode as well", () => {
        const chess = new Chess("bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1", {chess960: true})
        assert.true(chess.loadPgn(`[SetUp "1"]
[FEN "bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1"]

1. O-O`))
        assert.equal(chess.fen(), "bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNRKB b kq - 1 1")
        assert.false(chess.isCheck())
        assert.equal(chess.moveNumber(), 1)
    })
})
