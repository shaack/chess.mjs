# Chess.js Tests

This directory contains tests for the Chess.js library.

## Running Tests

To run the tests, you need to have Node.js and npm installed. Then, you can run the following commands:

```bash
# Install dependencies
npm install

# Run tests
npm test
```

## Test Files

### Chess960.test.js

This file contains tests for the Chess960 (Fischer Random Chess) functionality in Chess.js. It tests:

1. Chess960 mode setting and getting
2. Generating Chess960 positions
3. Resetting the board to Chess960 positions
4. Validating that generated positions follow Chess960 rules:
   - Each position has exactly 1 king, 1 queen, 2 rooks, 2 knights, and 2 bishops
   - The king is positioned between the two rooks
   - The bishops are on opposite colored squares

## Adding New Tests

To add new tests, create a new test file in this directory with a `.test.js` extension. Jest will automatically discover and run all test files in this directory.