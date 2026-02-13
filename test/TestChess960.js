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
        // console.log(chess.pgn())
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
        console.log(chess960.moves())
        assert.true(chess960.move("O-O-O"))
        assert.equal(chess960.fen(), "rbqnkrbn/pp5p/2ppppp1/8/8/2PPN3/PPBQPPPP/2KR1RBN b kq - 1 6")
        // verify game continues after castling
        assert.true(chess960.move("b6"))
        assert.true(chess960.move("a3"))
        assert.equal(chess960.fen(), "rbqnkrbn/p6p/1pppppp1/8/8/P1PPN3/1PBQPPPP/2KR1RBN b kq - 0 7")
    })

    it("should not castle in standard chess", function () {
        const standard = new Chess("nqnrkbbr/pppppppp/8/8/8/8/PPPPPPPP/NQNRKBBR w KQkq - 0 1")
        assert.false(standard.chess960())
        assert.true(standard.move("Nd3"))
        assert.true(standard.move("a5"))
        // should not castle in a standard variant
        assert.false(standard.move("O-O-O"))
        console.log(standard.pgn())
        console.log(standard.fen())
    })
})