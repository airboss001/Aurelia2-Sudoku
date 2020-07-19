//Code from: https://www.emanueleferonato.com/2015/06/23/pure-javascript-sudoku-generatorsolver/
export class SudokuGenerator
{
    // we start with an empty sudoku...
    // origin is by row starting at top, and working down
    sudoku: number[] = [];

    // ... and we solve it!!
    generate()
    {
        this.sudoku = new Array(81).fill(0);
        this.solve(this.sudoku);
    }

    // given a sudoku cell, returns the row
    returnRow(cell)
    {
        return Math.floor(cell / 9);
    }

    // given a sudoku cell, returns the column
    returnCol(cell)
    {
        return cell % 9;
    }

    // given a sudoku cell, returns the 3x3 block
    returnBlock(cell)
    {
        return Math.floor(this.returnRow(cell) / 3) * 3 + Math.floor(this.returnCol(cell) / 3);
    }

    // given a number, a row and a sudoku, returns true if the number can be placed in the row
    isPossibleRow(number, row, sudoku)
    {
        for (let i = 0; i <= 8; i++)
        {
            if (sudoku[ row * 9 + i ] == number)
            {
                return false;
            }
        }

        return true;
    }

    // given a number, a column and a sudoku, returns true if the number can be placed in the column
    isPossibleCol(number, col, sudoku)
    {
        for (let i = 0; i <= 8; i++)
        {
            if (sudoku[ col + 9 * i ] == number)
            {
                return false;
            }
        }

        return true;
    }

    // given a number, a 3x3 block and a sudoku, returns true if the number can be placed in the block
    isPossibleBlock(number, block, sudoku)
    {
        for (let i = 0; i <= 8; i++)
        {
            let offset = this.getOffsets(block, i);
            if (sudoku[ offset.col + offset.row ] == number)
            {
                return false;
            }
        }

        return true;
    }

    // given a cell, a number and a sudoku, returns true if the number can be placed in the cell
    isPossibleNumber(cell, number, sudoku)
    {
        let row = this.returnRow(cell);
        let col = this.returnCol(cell);
        let block = this.returnBlock(cell);

        return this.isPossibleRow(number, row, sudoku) && this.isPossibleCol(number, col, sudoku) && this.isPossibleBlock(number, block, sudoku);
    }

    // given a row and a sudoku, returns true if it's a legal row
    isCorrectRow(row, sudoku)
    {
        let rightSequence = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9);
        let rowTemp = new Array();
        for (let i = 0; i <= 8; i++)
        {
            rowTemp[ i ] = sudoku[ row * 9 + i ];
        }
        rowTemp.sort();
        return rowTemp.join() == rightSequence.join();
    }

    // given a column and a sudoku, returns true if it's a legal column
    isCorrectCol(col, sudoku)
    {
        let rightSequence = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9);
        let colTemp = new Array();
        for (let i = 0; i <= 8; i++)
        {
            colTemp[ i ] = sudoku[ col + i * 9 ];
        }
        colTemp.sort();
        return colTemp.join() == rightSequence.join();
    }

    getOffsets(block, i)
    {
        let colOffset = Math.floor(block / 3) * 27 + i % 3;
        let rowOffset = 9 * Math.floor(i / 3) + 3 * (block % 3);
        return {col: colOffset, row: rowOffset};
    }

    // given a 3x3 block and a sudoku, returns true if it's a legal block 
    isCorrectBlock(block, sudoku)
    {
        let rightSequence = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9);
        let blockTemp = new Array();
        for (let i = 0; i <= 8; i++)
        {
            let offset = this.getOffsets(block, i);
            blockTemp[ i ] = sudoku[ offset.col + offset.row ];
        }
        blockTemp.sort();
        return blockTemp.join() == rightSequence.join();
    }

    // given a sudoku, returns true if the sudoku is solved
    isSolvedSudoku(sudoku)
    {
        for (let i = 0; i <= 8; i++)
        {
            if (!this.isCorrectBlock(i, sudoku) || !this.isCorrectRow(i, sudoku) || !this.isCorrectCol(i, sudoku))
            {
                return false;
            }
        }
        return true;
    }

    // given a cell and a sudoku, returns an array with all possible values we can write in the cell
    determinePossibleValues(cell, sudoku)
    {
        let possible = new Array();
        for (let i = 1; i <= 9; i++)
        {
            if (this.isPossibleNumber(cell, i, sudoku))
            {
                possible.unshift(i);
            }
        }
        return possible;
    }

    // given an array of possible values assignable to a cell, returns a random value picked from the array
    determineRandomPossibleValue(possible, cell)
    {
        let randomPicked = Math.floor(Math.random() * possible[ cell ].length);
        return possible[ cell ][ randomPicked ];
    }

    // given a sudoku, returns a two dimension array with all possible values 
    scanSudokuForUnique(sudoku)
    {
        let possible = new Array();
        for (let i = 0; i <= 80; i++)
        {
            if (sudoku[ i ] == 0)
            {
                possible[ i ] = new Array();
                possible[ i ] = this.determinePossibleValues(i, sudoku);
                if (possible[ i ].length == 0)
                {
                    return false;
                }
            }
        }
        return possible;
    }

    // given an array and a number, removes the number from the array
    removeAttempt(attemptArray, number)
    {
        let newArray = new Array();
        for (let i = 0; i < attemptArray.length; i++)
        {
            if (attemptArray[ i ] != number)
            {
                newArray.unshift(attemptArray[ i ]);
            }
        }
        return newArray;
    }

    // given a two dimension array of possible values, returns the index of a cell where there are the less possible numbers to choose from
    nextRandom(possible)
    {
        let max = 9;
        let minChoices = 0;
        for (let i = 0; i <= 80; i++)
        {
            if (possible[ i ] != undefined)
            {
                if ((possible[ i ].length <= max) && (possible[ i ].length > 0))
                {
                    max = possible[ i ].length;
                    minChoices = i;
                }
            }
        }
        return minChoices;
    }

    // given a sudoku, solves it
    solve(sudoku)
    {
        let saved = new Array();
        let savedSudoku = new Array();
        let i = 0;
        let nextMove;
        let whatToTry;
        let attempt;

        while (!this.isSolvedSudoku(this.sudoku))
        {
            i++;
            nextMove = this.scanSudokuForUnique(this.sudoku);
            if (nextMove == false)
            {
                nextMove = saved.pop();
                this.sudoku = savedSudoku.pop();
            }
            whatToTry = this.nextRandom(nextMove);
            attempt = this.determineRandomPossibleValue(nextMove, whatToTry);
            if (nextMove[ whatToTry ].length > 1)
            {
                nextMove[ whatToTry ] = this.removeAttempt(nextMove[ whatToTry ], attempt);
                saved.push(nextMove.slice());
                savedSudoku.push(this.sudoku.slice());
            }
            this.sudoku[ whatToTry ] = attempt;
        }
        this.showSudoku(this.sudoku, i);
    }

    // given a solved sudoku and the number of steps, prints out the sudoku
    showSudoku(sudoku, i)
    {
        let sudokuText = "";
        let solved = "\n\nSolved in " + i + " steps";
        for (let i = 0; i <= 8; i++)
        {
            for (let j = 0; j <= 8; j++)
            {
                sudokuText += " ";
                sudokuText += sudoku[ i * 9 + j ];
                sudokuText += " ";
                if (j != 8)
                {
                    sudokuText += "|";
                }
            }
            if (i != 8)
            {
                sudokuText += "\n---+---+---+---+---+---+---+---+---\n";
            }
        }
        sudokuText += solved;
        console.log(sudokuText);
    }
}