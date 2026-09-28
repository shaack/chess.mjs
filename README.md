# chess.mjs

chess.mjs is a fork of [chess.js](https://github.com/jhlywa/chess.js) v0.13.4 with two goals. It is a native ES6 module without a build step, and it implements **Chess960** (Fischer Random Chess). The public API is the chess.js 0.13 API, so code written for chess.js 0.x works with minimal changes.

chess.mjs is the move validator behind [chessmail.de](https://www.chessmail.de) and [chessmail.eu](https://www.chessmail.eu), where it runs both in the browser and on the Node.js server for standard chess and Chess960 games.

This means that chess.mjs is daily used in production and tested with millions of moves.

## Installation

```bash
npm install chess.mjs
```

The package has no runtime dependencies.

## Usage as ES6 module

chess.mjs is published as an ES module only. There is no CommonJS build, no UMD bundle and no global `Chess` variable. `package.json` declares `"type": "module"` and points `main` to `src/Chess.js`.

All symbols are named exports. There is no default export.

```js
import {Chess} from "chess.mjs"                  // resolved via "main" in Node.js and by bundlers
import {Chess960} from "chess.mjs/src/Chess960.js"
```

### Node.js

Node.js resolves the bare specifier through the `main` field. Any Node.js version with unflagged ES module support works (12.17 or later). In a CommonJS project use a dynamic import:

```js
const {Chess} = await import("chess.mjs")
```

### Browser without a bundler

Import the file directly. A relative path to `node_modules` or an import map works. The test runner in `test/index.html` uses the same technique for its test dependency:

```html
<script type="importmap">
{
    "imports": {
        "chess.mjs/": "./node_modules/chess.mjs/"
    }
}
</script>
<script type="module">
    import {Chess} from "chess.mjs/src/Chess.js"
    const chess = new Chess()
    console.log(chess.moves())
</script>
```

### Bundlers

Rollup, webpack, Vite and esbuild pick the module up like any other ES module. chessmail.de bundles it with Rollup.

### Example

```js
import {Chess} from "chess.mjs"

const chess = new Chess()
while (!chess.game_over()) {
    const moves = chess.moves()
    chess.move(moves[Math.floor(Math.random() * moves.length)])
}
console.log(chess.pgn())
```

### Constants

The constants that chess.js exposes on every instance are also available as named exports, which is more natural in a module. Both forms work.

```js
import {Chess, WHITE, BLACK, PAWN, KNIGHT, BISHOP, ROOK, QUEEN, KING, SQUARES, FLAGS} from "chess.mjs"

const chess = new Chess()
chess.turn() === WHITE        // module constant
chess.turn() === chess.WHITE  // instance constant, as in chess.js
```

`SQUARES` and `FLAGS` on an instance are copies. Mutating them does not affect other instances or the module constants.

`Chess` is a factory function, not a class. `new Chess()` and `Chess()` return the same kind of object. Do not `extend` it.

## Chess960

### Enabling Chess960

Chess960 is an option of the constructor. Without it the instance plays standard chess, even if the loaded FEN happens to be a Chess960 start position.

```js
import {Chess} from "chess.mjs"

// start position by FEN
const chess = new Chess("nrkbrnbq/pppppppp/8/8/8/8/PPPPPPPP/NRKBRNBQ w KQkq - 0 1", {chess960: true})

// standard start position, but Chess960 castling rules
const chess2 = new Chess({chess960: true})

chess.chess960()  // -> true
```

The mode is fixed for the lifetime of the instance. `load()`, `load_pgn()` and `reset()` keep it. `load_pgn()` does not evaluate a `[Variant "Chess960"]` header, the instance itself has to be created in Chess960 mode. The PGN must contain `[SetUp "1"]` and `[FEN "..."]` for the start position, as in chess.js.

```js
const chess = new Chess(null, {chess960: true})
chess.load_pgn(`[SetUp "1"]
[FEN "nrkbrnbq/pppppppp/8/8/8/8/PPPPPPPP/NRKBRNBQ w KQkq - 0 1"]

1. f4 Nb6 2. Nb3 f6 3. e4 e5 4. f5 d5 5. g4 Nfd7 6. exd5 Bxd5 7. Bf3 c6 8. Ng3 Be7 9. O-O-O Qg8`)
```

### Start positions

The class `Chess960` in `src/Chess960.js` generates and identifies the 960 start positions. It uses the standard numbering by Reinhard Scharnagl, in which position 518 is the classical chess setup.

```js
import {Chess960} from "chess.mjs/src/Chess960.js"

Chess960.generateStartPosition(518)
// -> "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

Chess960.generateStartPosition()      // random position, 0 to 959
Chess960.generateStartPosition(960)   // throws, id must be 0 to 959

Chess960.detectStartPosition("rbqnkrbn/pppppppp/8/8/8/8/PPPPPPPP/RBQNKRBN w KQkq - 0 1")
// -> 604
```

`detectStartPosition()` only accepts complete start positions. It throws if the black back rank does not mirror the white one, if the pawns are not on their start ranks, or if the piece pattern is not one of the 960 positions.

`generateStartPosition()` returns a FEN with the castling field `KQkq`, see next section.

### FEN and castling rights

chess.mjs writes and reads castling rights as `KQkq` in Chess960 too. The letters have the X-FEN meaning: `K` and `k` refer to the **outermost** rook on the h-side of the king, `Q` and `q` to the outermost rook on the a-side. Shredder-FEN, which spells the rook files instead (`HAha`, `CGcg`), is rejected by `validate_fen()` and `load()`.

When a FEN is loaded (constructor, `load()`, `load_pgn()`), chess.mjs scans the back rank of each king and records the outermost rook on either side as the castling rook. The choice of the outermost rook matters when a promoted rook stands between the king and its castling rook: that inner rook blocks castling and can never be castled with.

The castling rook squares are determined only when a FEN is loaded. Positions assembled with `put()` and `remove()` keep the rook squares of the previously loaded FEN, or the corner squares if none was loaded. Load a FEN when you need castling in a hand-built Chess960 position.

Each instance keeps its own castling rook squares. An earlier version shared them at module level, which corrupted concurrent games on the server. The regression test replays the affected production game against a second instance.

### Castling moves

In Chess960 the king and the rook may start on any files, so the king's destination alone does not identify a castling move. chess.mjs uses the convention that many engines and GUIs use: **a castling move is the king moving onto its own rook**. `from` is the king's square, `to` is the rook's square.

```js
const chess = new Chess("bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNKRB w KQkq - 0 1", {chess960: true})

chess.moves({square: "f1", verbose: true})
// contains { color: 'w', from: 'f1', to: 'g1', flags: 'k', piece: 'k', san: 'O-O' }

chess.move({from: "f1", to: "g1"})   // castles kingside
chess.move("O-O")                    // same move by SAN
chess.fen()
// -> "bnrqnkrb/pppppppp/8/8/8/8/PPPPPPPP/BNRQNRKB b kq - 1 1"
```

This has consequences for user interfaces. A board that lets the user drag the king onto the own rook produces exactly the move object chess.mjs expects. A board that only knows the standard two-square king move has to translate it. The `captured` field is not set on castling moves, although `to` holds an own piece.

The result of castling follows the Chess960 rules regardless of where king and rook started. After kingside castling the king stands on g1 (g8) and the rook on f1 (f8). After queenside castling the king stands on c1 (c8) and the rook on d1 (d8). Special cases are handled:

- The rook already stands on its destination square (for example king e1, rook d1 for O-O-O). Only the king moves.
- The king already stands on its destination square (king g1, rook h1 for O-O). Only the rook moves.
- King and rook swap squares (king f1, rook g1 for O-O).
- King and rooks on the classical squares (position 518). The result is identical to standard chess.

A castling move is legal when all of the following hold. The player still has the castling right on that side. All squares between the king and its destination are empty, the castling rook itself excepted. All squares between the rook and its destination are empty, the king itself excepted. The king is not in check, does not pass through an attacked square and does not end on an attacked square.

Castling rights are removed as usual when the king moves or castles, when a castling rook moves, or when a castling rook is captured on its start square. `undo()` restores the position including the castling rights, also after castling.

SAN input and output are unchanged. `move("O-O")` and `move("O-O-O")` work, and `history()`, `pgn()` and the `san` field of a verbose move produce `O-O` and `O-O-O`.

### Standard chess is unaffected

Without `{chess960: true}` the original chess.js castling code runs. The king moves two squares, the rook is taken from the corner, and the move object has the king's destination as `to`, exactly as in chess.js. Existing code sees no difference.

## Differences to chess.js

chess.mjs is based on chess.js **0.13.4** and keeps its API. It is not based on chess.js 1.x, which renamed most methods to camelCase and changed error handling.

### Coming from chess.js 0.x

Change the import and you are done.

```js
// before
const {Chess} = require("chess.js")
import {Chess} from "chess.js"

// after
import {Chess} from "chess.mjs"
```

What differs:

| Topic | chess.js 0.13.4 | chess.mjs |
|---|---|---|
| Module format | UMD, CommonJS, ES module via bundler | ES module only, named exports, no global |
| Constructor | `Chess([fen])` | `Chess([fen], [options])`, `Chess(options)` |
| `options.chess960` | not available | enables Chess960 castling rules |
| `.chess960()` | not available | returns whether the instance is in Chess960 mode |
| Castling move `to` | king's destination square | same in standard mode, **rook's square in Chess960 mode** |
| Constants | on the instance | on the instance and as named exports |
| `Chess960` class | not available | generates and detects the 960 start positions |
| Tests | Node.js (Jest) | browser test runner, see [Testing](#testing) |

Everything else, including snake_case method names, the `sloppy` option, comments, headers and the return values `null` and `false` for illegal moves and invalid FENs, is unchanged.

### Coming from chess.js 1.x

chess.js 1.x is a TypeScript rewrite with a different surface. chess.mjs uses the 0.13 names and semantics. The most common translations:

| chess.js 1.x | chess.mjs |
|---|---|
| `isCheck()`, `isCheckmate()`, `isStalemate()`, `isDraw()` | `in_check()`, `in_checkmate()`, `in_stalemate()`, `in_draw()` |
| `isInsufficientMaterial()`, `isThreefoldRepetition()` | `insufficient_material()`, `in_threefold_repetition()` |
| `isGameOver()` | `game_over()` |
| `loadPgn()` | `load_pgn()` |
| `validateFen()` (exported function) | `chess.validate_fen()` (method) |
| `squareColor()` | `square_color()` |
| `getComment()`, `setComment()`, `removeComment()`, `getComments()`, `removeComments()` | `get_comment()`, `set_comment()`, `delete_comment()`, `get_comments()`, `delete_comments()` |
| `setHeader()`, `getHeaders()` | `header()` |
| `move()` throws on an illegal move | `move()` returns `null` |
| `load()` throws on an invalid FEN | `load()` returns `false` |
| `move(san, {strict: true})` | `move(san, {sloppy: true})` with inverted meaning |
| `moves({verbose: true})` includes `lan`, `before`, `after` | not included |

## API overview

The detailed method documentation of chess.js 0.13.4 applies unchanged and is included in this repository as [doc/chess.js.md](doc/chess.js.md). The list below is the complete public surface of chess.mjs with a short description. Methods marked *new* do not exist in chess.js.

Construction and position:

| Method | Description |
|---|---|
| `Chess([fen], [options])` | Creates a game. `options.chess960` enables Chess960. Can be called with `new` or without. |
| `.load(fen)` | Loads a FEN. Returns `false` if the FEN is invalid. Detects the Chess960 castling rooks. |
| `.reset()` | Loads the standard start position. |
| `.clear()` | Empties the board. |
| `.fen()` | Returns the current position as FEN. |
| `.validate_fen(fen)` | Validates a FEN, returns `{valid, error_number, error}`. Castling field must be `KQkq`-style. |
| `.board()` | Returns the board as an 8x8 array of `{square, type, color}` or `null`. |
| `.ascii()` | Returns the board as ASCII art. |
| `.get(square)`, `.put(piece, square)`, `.remove(square)` | Reads, places and removes single pieces. |
| `.square_color(square)` | Returns `"light"` or `"dark"`. |
| `.turn()` | Returns `"w"` or `"b"`. |
| `.chess960()` | *new*. Returns `true` in Chess960 mode. |

Moves:

| Method | Description |
|---|---|
| `.moves([options])` | Legal moves as SAN strings, or as move objects with `{verbose: true}`. `{square}` restricts to one piece. |
| `.move(move, [options])` | Makes a move given as SAN or as `{from, to, promotion}`. Returns the move object or `null`. `{sloppy: true}` accepts non-standard notation. |
| `.undo()` | Takes back the last move and returns it, or `null`. |
| `.history([options])` | Played moves as SAN strings or, with `{verbose: true}`, as move objects. |
| `.perft(depth)` | Counts leaf nodes of the move tree. Debugging aid. |

Game state:

| Method | Description |
|---|---|
| `.in_check()`, `.in_checkmate()`, `.in_stalemate()` | Check, mate and stalemate detection. |
| `.in_draw()` | Fifty-move rule, stalemate, insufficient material or threefold repetition. |
| `.insufficient_material()`, `.in_threefold_repetition()` | The individual draw conditions. |
| `.game_over()` | Checkmate or any draw condition. |

PGN, headers and comments:

| Method | Description |
|---|---|
| `.pgn([options])` | Exports the game as PGN. `{max_width, newline_char}` control formatting. |
| `.load_pgn(pgn, [options])` | Imports a PGN. Returns `false` on failure. `{sloppy, newline_char}` as in chess.js. |
| `.header([key, value, ...])` | Sets header pairs, returns all headers. |
| `.get_comment()`, `.set_comment(comment)`, `.delete_comment()` | Comment on the current position. |
| `.get_comments()`, `.delete_comments()` | All comments of the game as `{fen, comment}`. |

Chess960 helper class, `import {Chess960} from "chess.mjs/src/Chess960.js"`:

| Method | Description |
|---|---|
| `Chess960.generateStartPosition([id])` | *new*. FEN of start position `id` (0 to 959), random position without argument. |
| `Chess960.detectStartPosition(fen)` | *new*. Returns the id of a start position FEN, throws if the FEN is not a Chess960 start position. |

## Testing

The tests use [teevi](https://www.npmjs.com/package/teevi) and run in the browser. After `npm install`, open `test/index.html` from a local web server (ES modules do not load from `file://`).

The suite has three parts:

- `test/TestChess.js` covers the chess.js behaviour that chessmail relies on, such as PGN with variations and comments, and non-standard PGNs.
- `test/TestChess960.js` covers start position generation and detection for all 960 positions, and the castling edge cases described above, including per-instance castling rook squares and the outermost-rook rule.
- `test/TestChessmailGames.js` replays 1947 real, anonymized games from chessmail.de, among them every Chess960 game played there so far, and compares the resulting FEN with the FEN the production server stored when the game ended. The stored FENs of the older games were written by chess.js 0.9.3, so this checks chess.mjs against an independent implementation. The fixture was validated once against 19263 production games with zero mismatches. It is part of the repository but excluded from the npm package.

## License

chess.mjs is released under the BSD-2-Clause license, like chess.js. See [LICENSE](LICENSE).
