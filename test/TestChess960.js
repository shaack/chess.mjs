/**
 * @author Stefan Haack (https://shaack.com)
 */
import {describe, it, assert} from "teevi/src/teevi.js"
import {Chess} from "../src/Chess.js"
import {chess960StartPositions} from "./chess960StartPositions.js"
import {Chess960} from "../src/Chess960.js";

describe("chess.mjs unit tests for Chess 960", function () {

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

    it("should load a chess960 game from a valid chess960 fen and do castling", function() {
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
        console.log(chess.fen())
    })

    // TODO load a PGN with SetUp and FEN
})