import * as C from "./constants";

export class SudokuUtils
{
    static randomIntFromInterval(min, max): number
    { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    static range(start, stop, step = 1): number[]
    {
        return [ ...Array(stop - start).keys() ]
            .filter(i => !(i % Math.round(step)))
            .map(v => start + v)
    }

    static *rangeLazy(start, end, step = 1)
    {
        if (end === undefined) 
        {
            [ end, start ] = [ start, 0 ];
        }

        for (let n = start; n < end; n += step) 
        {
            yield n;
        }
    }

    static shuffle(array: number[]): void
    {
        for (var i = array.length - 1; i > 0; i--)
        {
            var rand = Math.floor(Math.random() * (i + 1));
            [ array[ i ], array[ rand ] ] = [ array[ rand ], array[ i ] ]
        }
    }

    static returnCol(cell: number): number
    {
        return cell % C.blockSize;
    }

    static getOffsets(block, i)
    {
        let colOffset = Math.floor(block / C.cellColSize) * C.cellsInBlock + i % C.cellColSize;
        let rowOffset = C.blockSize * Math.floor(i / C.cellRowSize) + C.cellRowSize * (block % C.cellRowSize);
        return { col: colOffset, row: rowOffset };
    }

    // given a row and a sudoku, returns true if it's a legal row
    static isCorrectRow(row, sudoku)
    {
        let rightSequence = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9);
        let rowTemp = new Array();
        for (let i = 0; i <= C.blockLoopMax; i++)
        {
            rowTemp[ i ] = sudoku[ row * C.blockSize + i ];
        }
        rowTemp.sort();
        return rowTemp.join() == rightSequence.join();
    }

    // given a column and a sudoku, returns true if it's a legal column
    static isCorrectCol(col, sudoku)
    {
        let rightSequence = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9);
        let colTemp = new Array();
        for (let i = 0; i <= C.blockLoopMax; i++)
        {
            colTemp[ i ] = sudoku[ col + i * C.blockSize ];
        }
        colTemp.sort();
        return colTemp.join() == rightSequence.join();
    }

    // given a 3x3 block and a sudoku, returns true if it's a legal block 
    static isCorrectBlock(block, sudoku)
    {
        let rightSequence = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9);
        let blockTemp = new Array();
        for (let i = 0; i <= C.blockLoopMax; i++)
        {
            let offset = this.getOffsets(block, i);
            blockTemp[ i ] = sudoku[ offset.col + offset.row ];
        }
        blockTemp.sort();
        return blockTemp.join() == rightSequence.join();
    }

    // given a sudoku, returns true if the sudoku is solved
    static isSolvedSudoku(sudoku)
    {
        for (let i = 0; i <= C.blockLoopMax; i++)
        {
            if (!this.isCorrectBlock(i, sudoku) || !this.isCorrectRow(i, sudoku) || !this.isCorrectCol(i, sudoku))
            {
                return false;
            }
        }
        return true;
    }

}