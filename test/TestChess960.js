/**
 * @author Stefan Haack (https://shaack.com)
 */
import {describe, it, assert} from "teevi/src/teevi.js"
import {Chess} from "../src/Chess.js"
import {chess960StartPositions} from "./chess960StartPositions.js"
import {Chess960} from "../src/Chess960.js"

describe("TestChess960", function () {

    it("should generate a valid FEN for Chess 960 based on the list in chess960StartPositions.js", () => {
        const chess = new Chess()
        chess960StartPositions.forEach((position, index) => {
            const fen = Chess960.generateStartPosition(index)
            // console.log(index, position, fen);
            assert.equal(fen, position)
            const chess960 = new Chess(fen, {chess960: true})
            assert.equal(chess960.fen(), position)
        })
    })

    it("should load a chess960 game from a valid chess960 fen and do castling", function () {
        const fen = "nrkbrnbq/pppppppp/8/8/8/8/PPPPPPPP/NRKBRNBQ w KQkq - 0 1"
        const chess = new Chess(fen, {chess960: true})
        assert.equal(chess.fen(), fen)
        assert.true(chess.move("f4"))
        assert.true(chess.move("Nb6"))
        assert.true(chess.move("Nb3"))
        assert.true(chess.move("f6"))
        assert.true(chess.move("e4"))
        assert.true(chess.move("e5"))
        assert.true(chess.move("f5"))
        assert.true(chess.move("d5"))
        assert.true(chess.move("g4"))
        assert.true(chess.move("Nfd7"))
        assert.true(chess.move("exd5"))
        assert.true(chess.move("Bxd5"))
        assert.true(chess.move("Bf3"))
        assert.true(chess.move("c6"))
        assert.true(chess.move("Ng3"))
        assert.true(chess.move("Be7"))
        assert.true(chess.move("O-O-O"))
        assert.true(chess.move("Qg8"))
        assert.equal(chess.fen(), "1rk1r1q1/pp1nb1pp/1np2p2/3bpP2/6P1/1N3BN1/PPPP3P/2KRR1BQ w kq - 4 10")

    })

    it("should load a chess960 game from a valid chess960 pgn", function () {
        const pgn = `[Event "Freestyle Weissenhaus KO"]
[Site "Wangels GER"]
[Date "2025.02.09"]
[EventDate "2025.02.09"]
[Round "1.1"]
[Result "1-0"]
[White "Levon Aronian"]
[Black "Vladimir Fedoseev"]
[ECO "?"]
[WhiteElo "?"]
[BlackElo "?"]
[PlyCount "72"]
[SetUp "1"]
[FEN "nrkbrnbq/pppppppp/8/8/8/8/PPPPPPPP/NRKBRNBQ w KQkq - 0 1"]

1. f4 Nb6 2. Nb3 f6 3. e4 e5 4. f5 d5 5. g4 Nfd7 6. exd5 Bxd5 7. Bf3 c6 8.
Ng3 Be7 9. O-O-O Qg8 10. d3 Bb4 11. c3 Be7 12. c4 Bxf3 13. Qxf3 Qf7 14. Ne4
O-O 15. Be3 Na4 16. Rg1 b5 17. c5 b4 18. Qf2 Rb5 19. Qc2 a5 20. d4 Ra8 21.
g5 Kh8 22. gxf6 Bxf6 23. d5 cxd5 24. Nd6 Qf8 25. Nxb5 d4 26. c6 Rc8 27.
N3xd4 exd4 28. Bxd4 Nac5 29. Bxf6 Nxf6 30. c7 b3 31. axb3 Na6 32. Kb1 Nb4
33. Qc4 Ne8 34. Rd8 Qxf5+ 35. Ka1 Nc2+ 36. Qxc2 1-0`
        const chess = new Chess(null, {chess960: true})
        chess.load_pgn(pgn)
        assert.equal(chess.fen(), "2rRn2k/2P3pp/8/pN3q2/8/1P6/1PQ4P/K5R1 b - - 0 36")
    })

    it("should not have isolation problems with the rooks", function () {
        // First create a Chess960 game with rooks in non-standard positions
        const chess960 = new Chess("qbnnbrkr/pppppppp/8/8/8/8/PPPPPPPP/QBNNBRKR w KQkq - 0 1", {chess960: true})
        assert.equal(chess960.fen(), "qbnnbrkr/pppppppp/8/8/8/8/PPPPPPPP/QBNNBRKR w KQkq - 0 1")
        assert.equal(chess960.chess960(), true)
        // Now create a regular chess game
        const regularChess = new Chess("qbnnbrkr/pppppppp/8/8/8/8/PPPPPPPP/QBNNBRKR w KQkq - 0 1")
        assert.equal(regularChess.fen(), "qbnnbrkr/pppppppp/8/8/8/8/PPPPPPPP/QBNNBRKR w KQkq - 0 1")
        assert.equal(regularChess.chess960(), false)
    })

    it("should do a queen side castling in chess960", function () {
        const chess960 = new Chess("nqnrkbbr/pppppppp/8/8/8/8/PPPPPPPP/NQNRKBBR w KQkq - 0 1", {chess960: true})
        assert.true(chess960.chess960())
        assert.true(chess960.move("Nd3"))
        assert.true(chess960.move("a5"))
        // should castle in a chess960 variant
        assert.true(chess960.move("O-O-O"))
        // The rook should remain at d1 after castling (king moves from e1 to c1, rook stays at d1)
        assert.equal(chess960.fen(), "nqnrkbbr/1ppppppp/8/p7/8/3N4/PPPPPPPP/NQKR1BBR b kq - 1 2")
    })

    it("should do a king side castling in chess960", function () {
        const chess960_2 = new Chess("bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1", {chess960: true})
        assert.true(chess960_2.chess960())
        assert.true(chess960_2.move("O-O"))
        // King and rook swap positions: king f1->g1, rook g1->f1
        assert.equal(chess960_2.fen(), "bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNRKB b kq - 1 1")
    })

    it("should do a queen side castling in chess960 with start position 604", function () {
        const fen = Chess960.generateStartPosition(604)
        assert.equal(fen, "rbqnkrbn/pppppppp/8/8/8/8/PPPPPPPP/RBQNKRBN w KQkq - 0 1")
        const chess960 = new Chess(fen, {chess960: true})
        assert.true(chess960.chess960())
        assert.true(chess960.move("d3"))
        assert.true(chess960.move("d6"))
        assert.true(chess960.move("Ne3")) // Nd1-e3, clears d1
        assert.true(chess960.move("e6"))
        assert.true(chess960.move("c3"))
        assert.true(chess960.move("c6"))
        assert.true(chess960.move("Bc2")) // Bb1-c2, clears b1
        assert.true(chess960.move("f6"))
        assert.true(chess960.move("Qd2")) // Qc1-d2, clears c1
        assert.true(chess960.move("g6"))
        // White castles queenside: King e1→c1, Rook a1→d1
        assert.true(chess960.move("O-O-O"))
        assert.equal(chess960.fen(), "rbqnkrbn/pp5p/2ppppp1/8/8/2PPN3/PPBQPPPP/2KR1RBN b kq - 1 6")
        // verify game continues after castling
        assert.true(chess960.move("b6"))
        assert.true(chess960.move("a3"))
        assert.equal(chess960.fen(), "rbqnkrbn/p6p/1pppppp1/8/8/P1PPN3/1PBQPPPP/2KR1RBN b kq - 0 7")
    })

    it("should detect the correct start position id from a FEN", () => {
        for (let id = 0; id < 960; id++) {
            const fen = Chess960.generateStartPosition(id)
            assert.equal(Chess960.detectStartPosition(fen), id)
        }
    })

    it("should throw when black pieces don't mirror white pieces", () => {
        // White back rank is RNBQKBNR but black back rank is rnbkqbnr (swapped king/queen)
        const fen = "rnbkqbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        assert.throws(() => {
            Chess960.detectStartPosition(fen)
        })
    })

    it("should throw when white pawns are not on second rank", () => {
        const fen = "rnbqkbnr/pppppppp/8/8/8/PPPPPPPP/8/RNBQKBNR w KQkq - 0 1"
        assert.throws(() => {
            Chess960.detectStartPosition(fen)
        })
    })

    it("should throw when black pawns are not on seventh rank", () => {
        const fen = "rnbqkbnr/8/pppppppp/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        assert.throws(() => {
            Chess960.detectStartPosition(fen)
        })
    })

    it("should not castle in standard chess", function () {
        const standard = new Chess("nqnrkbbr/pppppppp/8/8/8/8/PPPPPPPP/NQNRKBBR w KQkq - 0 1")
        assert.false(standard.chess960())
        assert.true(standard.move("Nd3"))
        assert.true(standard.move("a5"))
        // should not castle in a standard variant
        assert.false(standard.move("O-O-O"))
    })

    // --- Comprehensive castling tests ---

    it("should return castling moves with to=rook square in verbose mode", function () {
        // Position 604: RBQNKRBN, king e1, rooks a1 and f1
        const chess = new Chess("rbqnkrbn/pppppppp/8/8/2PPN3/8/PPBQPPPP/R3KRBN w KQkq - 0 1", {chess960: true})
        const kingMoves = chess.moves({square: "e1", verbose: true})
        const castlingMoves = kingMoves.filter(m => m.flags.includes("q") || m.flags.includes("k"))
        // O-O-O should target the queenside rook at a1
        const ooo = castlingMoves.find(m => m.flags.includes("q"))
        assert.true(!!ooo)
        assert.equal(ooo.from, "e1")
        assert.equal(ooo.to, "a1") // rook's square, not king destination c1
        assert.equal(ooo.san, "O-O-O")
    })

    it("should return kingside castling with to=rook square in verbose mode", function () {
        // Position 131: BNRQNKRB, king f1, rook g1 — can castle immediately
        const chess = new Chess("bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1", {chess960: true})
        const kingMoves = chess.moves({square: "f1", verbose: true})
        const oo = kingMoves.find(m => m.flags.includes("k"))
        assert.true(!!oo)
        assert.equal(oo.from, "f1")
        assert.equal(oo.to, "g1") // rook's square
        assert.equal(oo.san, "O-O")
    })

    it("should castle via from/to object (king captures own rook)", function () {
        // Position 604: after clearing queenside, castle O-O-O by moving king to rook
        const chess = new Chess("rbqnkrbn/pp5p/2ppppp1/8/8/2PPN3/PPBQPPPP/R3KRBN w KQkq - 0 1", {chess960: true})
        // Castle queenside by providing {from: king, to: rook}
        const result = chess.move({from: "e1", to: "a1"})
        assert.true(!!result)
        assert.equal(result.san, "O-O-O")
        // King should be on c1, rook on d1
        assert.equal(chess.get("c1").type, "k")
        assert.equal(chess.get("d1").type, "r")
        assert.equal(chess.get("e1"), null)
        assert.equal(chess.get("a1"), null)
    })

    it("should castle kingside via from/to object", function () {
        // Position 131: BNRQNKRB, king f1, rook g1
        const chess = new Chess("bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1", {chess960: true})
        const result = chess.move({from: "f1", to: "g1"})
        assert.true(!!result)
        assert.equal(result.san, "O-O")
        // King should be on g1, rook on f1
        assert.equal(chess.get("g1").type, "k")
        assert.equal(chess.get("f1").type, "r")
    })

    it("should undo castling and restore original position", function () {
        // Position 604: O-O-O
        const fen = "rbqnkrbn/pp5p/2ppppp1/8/8/2PPN3/PPBQPPPP/R3KRBN w KQkq - 0 1"
        const chess = new Chess(fen, {chess960: true})
        assert.true(!!chess.move("O-O-O"))
        // After castling: king c1, rook d1
        assert.equal(chess.get("c1").type, "k")
        assert.equal(chess.get("d1").type, "r")
        // Undo
        chess.undo()
        // Position should be fully restored
        assert.equal(chess.fen(), fen)
        assert.equal(chess.get("e1").type, "k")
        assert.equal(chess.get("a1").type, "r")
    })

    it("should undo kingside castling (king-rook swap)", function () {
        // Position 131: BNRQNKRB, king f1, rook g1 — swap positions
        const fen = "bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1"
        const chess = new Chess(fen, {chess960: true})
        assert.true(!!chess.move("O-O"))
        assert.equal(chess.get("g1").type, "k")
        assert.equal(chess.get("f1").type, "r")
        // Undo
        chess.undo()
        assert.equal(chess.fen(), fen)
        assert.equal(chess.get("f1").type, "k")
        assert.equal(chess.get("g1").type, "r")
    })

    it("should handle black castling in chess960", function () {
        // Position 131: BNRQNKRB — let black castle kingside
        const chess = new Chess("bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1", {chess960: true})
        assert.true(chess.move("d4"))
        // Black castles kingside: king f8, rook g8
        assert.true(chess.move("O-O"))
        assert.equal(chess.get("g8").type, "k")
        assert.equal(chess.get("f8").type, "r")
    })

    it("should handle castling where rook is already at destination (d1 for O-O-O)", function () {
        // Position with king e1, rook d1: O-O-O means king→c1, rook stays at d1
        const chess = new Chess("nqnrkbbr/pppppppp/8/8/8/8/PPPPPPPP/NQNRKBBR w KQkq - 0 1", {chess960: true})
        assert.true(chess.move("Nd3"))
        assert.true(chess.move("a6"))
        assert.true(chess.move("O-O-O"))
        // King to c1, rook stays at d1
        assert.equal(chess.get("c1").type, "k")
        assert.equal(chess.get("d1").type, "r")
    })

    it("should handle castling where king is already at destination (g1 for O-O)", function () {
        // King already on g1 (O-O destination), rook on h1
        // O-O: king stays at g1, rook h1→f1
        const fen = "4k3/8/8/8/8/8/8/6KR w K - 0 1"
        const chess = new Chess(fen, {chess960: true})
        assert.true(chess.move("O-O"))
        assert.equal(chess.get("g1").type, "k")
        assert.equal(chess.get("f1").type, "r")
        assert.equal(chess.get("h1"), null)
    })

    it("should handle castling in standard position (518) in chess960 mode", function () {
        // Position 518 is the standard starting position
        const fen = Chess960.generateStartPosition(518)
        assert.equal(fen, "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
        const chess = new Chess(fen, {chess960: true})
        // Standard opening to enable kingside castling
        assert.true(chess.move("e4"))
        assert.true(chess.move("e5"))
        assert.true(chess.move("Nf3"))
        assert.true(chess.move("Nc6"))
        assert.true(chess.move("Bc4"))
        assert.true(chess.move("Bc5"))
        assert.true(chess.move("O-O"))
        // Standard castling result: king g1, rook f1
        assert.equal(chess.get("g1").type, "k")
        assert.equal(chess.get("f1").type, "r")
        assert.equal(chess.get("e1"), null)
        assert.equal(chess.get("h1"), null)
    })

    it("should not set captured field on castling moves", function () {
        // In chess960, castling to=rook square, but the move should not have captured set
        const chess = new Chess("bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1", {chess960: true})
        const result = chess.move("O-O")
        assert.true(!!result)
        assert.equal(result.captured, undefined)
    })

    it("should handle both white and black castling in the same game", function () {
        // Position 131: BNRQNKRB — both sides can castle kingside immediately
        const chess = new Chess("bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1", {chess960: true})
        // White castles kingside
        assert.true(chess.move("O-O"))
        assert.equal(chess.fen(), "bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNRKB b kq - 1 1")
        // Black castles kingside
        assert.true(chess.move("O-O"))
        assert.equal(chess.get("g8").type, "k")
        assert.equal(chess.get("f8").type, "r")
    })

    it("should remove castling rights after castling", function () {
        const chess = new Chess("bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1", {chess960: true})
        assert.true(chess.move("O-O"))
        // White should have no castling rights, FEN should show "kq" not "KQkq"
        const fen = chess.fen()
        assert.true(fen.includes(" kq "))
    })

    it("should handle castling with rook on a1 and king far away", function () {
        // Position 604: RBQNKRBN — rook a1, king e1 (far apart)
        // After clearing b1/c1/d1, queen-side castle should work
        const chess = new Chess("rbqnkrbn/pp5p/2ppppp1/8/8/2PPN3/PPBQPPPP/R3KRBN w KQkq - 0 1", {chess960: true})
        const moves = chess.moves({verbose: true})
        const ooo = moves.find(m => m.san === "O-O-O")
        assert.true(!!ooo)
        assert.equal(ooo.from, "e1")
        assert.equal(ooo.to, "a1")
    })

    it("should correctly undo multiple moves including castling", function () {
        const fen = "bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1"
        const chess = new Chess(fen, {chess960: true})
        assert.true(chess.move("O-O"))
        assert.true(chess.move("d5"))
        assert.true(chess.move("d4"))
        // Undo all three moves
        chess.undo()
        chess.undo()
        chess.undo()
        assert.equal(chess.fen(), fen)
    })

    it("should handle castling where king moves to rook square and rook moves to king square (perfect swap)", function () {
        // Position 131: BNRQNKRB — king f1, rook g1
        // O-O: king f1→g1, rook g1→f1 — a perfect swap
        const chess = new Chess("bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1", {chess960: true})
        const beforeKing = chess.get("f1")
        const beforeRook = chess.get("g1")
        assert.equal(beforeKing.type, "k")
        assert.equal(beforeRook.type, "r")

        assert.true(chess.move("O-O"))

        const afterKing = chess.get("g1")
        const afterRook = chess.get("f1")
        assert.equal(afterKing.type, "k")
        assert.equal(afterRook.type, "r")
        // Old squares should have the swapped pieces, not be empty
        assert.equal(chess.get("f1").type, "r")
        assert.equal(chess.get("g1").type, "k")
    })

    it("should handle castling with rooks at a1 and h1 (corners)", function () {
        // Position where rooks are at the standard corners but king is elsewhere
        // Position 518 variant: king e1, rooks a1 and h1 (but with different piece arrangement)
        // Use a custom position: RNBKQBNR would have king d1, rooks a1 and h1 (but not valid chess960)
        // Use actual chess960 position with rooks near corners
        // Position 479: RKBBNQNR — king a1? No...
        // Let's use a cleared position directly
        const fen = "r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1"
        const chess = new Chess(fen, {chess960: true})
        // Kingside: king e1, rook h1
        const moves = chess.moves({square: "e1", verbose: true})
        const oo = moves.find(m => m.san === "O-O")
        const ooo = moves.find(m => m.san === "O-O-O")
        assert.true(!!oo)
        assert.true(!!ooo)
        assert.equal(oo.to, "h1")  // rook's square
        assert.equal(ooo.to, "a1") // rook's square
        // Execute kingside castling
        assert.true(chess.move("O-O"))
        assert.equal(chess.get("g1").type, "k")
        assert.equal(chess.get("f1").type, "r")
    })
})
