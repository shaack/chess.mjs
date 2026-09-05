/**
 * @author Stefan Haack (https://shaack.com)
 *
 * Replays real (anonymized) games from chessmail.de and compares the resulting
 * FEN with the one the production server stored when the game finished. The
 * stored FENs of the older games were written by chess.js 0.9.3, so this
 * verifies chess.mjs against an independent implementation. The fixture was
 * validated against 19263 production games; test/chessmailGames.js carries a
 * sample of them plus every Chess960 game played so far.
 */
import {describe, it, assert} from "teevi/src/teevi.js"
import {Chess} from "../src/Chess.js"
import {chessmailGames} from "./chessmailGames.js"

describe("TestChessmailGames", function () {

    it("should replay all chessmail games to the stored final FEN", () => {
        let checked = 0
        for (const game of chessmailGames) {
            const chess = new Chess(undefined, {chess960: !!game.chess960})
            if (!chess.load_pgn(game.pgn)) {
                throw new Error("load_pgn failed for: " + game.pgn.slice(0, 120))
            }
            if (chess.fen() !== game.fen) {
                throw new Error("FEN mismatch\npgn: " + game.pgn.slice(0, 120) +
                    "\nexpected: " + game.fen + "\nreplayed: " + chess.fen())
            }
            checked++
        }
        assert.equal(checked, chessmailGames.length)
        console.log("    " + checked + " chessmail games replayed, all FENs match")
    })
})
