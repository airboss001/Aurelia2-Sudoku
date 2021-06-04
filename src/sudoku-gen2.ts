import * as C from "./constants";
import {SudokuUtils} from "./sudoku-utils";

// maxSize is the size of the 2D matrix maxSize*maxSize
const maxSize = 9;


export class SudokuGen2
{
    _setRowPosition: number[] = [ 0, 0, 0, 3, 3, 3, 6, 6, 6 ];
    _setColPosition: number[] = [ 0, 3, 6, 0, 3, 6, 0, 3, 6 ];

    _numberSet: number[][] = new Array(maxSize).fill(0).map(() => new Array(maxSize).fill(0));;
    _problemSet: number[][] = new Array(maxSize).fill(0).map(() => new Array(maxSize).fill(0));;


    fillSudoko(grid: number[][], row: number, col: number)
    {
        let validCellValues: number[] = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];

        if (row == maxSize - 1 && col == maxSize)
            return true;

        if (col == maxSize)
        {
            row++;
            col = 0;
        }

        if (grid[ row ][ col ] != 0)
            return this.solveSudoko(grid, row, col + 1);

        SudokuUtils.shuffle(validCellValues);
        for (let value of validCellValues)
        {
            if (this.isSafe(grid, row, col, value))                        
            {
                grid[ row ][ col ] = value;
                if (this.fillSudoko(grid, row, col + 1))
                {
                    return true;
                }
            }
            grid[ row ][ col ] = 0;
        }

        return false;
    }

    solveSudoko(grid: number[][], row: number, col: number)
    {
        if (row == maxSize - 1 && col == maxSize)
            return true;
        if (col == maxSize)
        {
            row++;
            col = 0;
        }

        if (grid[ row ][ col ] != 0)
            return this.solveSudoko(grid, row, col + 1);

        for (let num: number = 1; num < 10; num++) 
        {
            if (this.isSafe(grid, row, col, num))
            {
                grid[ row ][ col ] = num;

                if (this.solveSudoko(grid, row, col + 1))
                    return true;
            }
            grid[ row ][ col ] = 0;
        }
        return false;
    }

    /* A utility function to print grid */
    print(grid: number[][])
    {
        let solved: string = "";
        for (let i: number = 0; i < maxSize; i++) 
        {
            for (let j: number = 0; j < maxSize; j++)
            {
                solved += grid[ i ][ j ] + " ";
            }
            solved += "\n";
        }
        console.log(solved);
    }

    // Check whether it will be legal
    // to assign num to the
    // given row, col
    isSafe(grid: number[][], row: number, col: number, num: number)
    {
        // Check if we find the same num
        // in the similar row , we
        // return false
        for (let x: number = 0; x <= 8; x++)
        {
            if (grid[ row ][ x ] == num)
                return false;
        }

        // Check if we find the same num
        // in the similar column ,
        // we return false
        for (let x: number = 0; x <= 8; x++)
        {
            if (grid[ x ][ col ] == num)
                return false;
        }
        // Check if we find the same num
        // inthe particular 3*3
        // matrix, we return false
        let startRow: number = row - row % 3
        let startCol: number = col - col % 3;

        for (let i: number = 0; i < 3; i++)
        {
            for (let j: number = 0; j < 3; j++)
            {
                if (grid[ i + startRow ][ j + startCol ] == num)
                    return false;
            }
        }

        return true;
    }

    unMask(minPos: number, maxPos: number, noOfSets: number)
    {
        let seed: number;
        let posX: number[] = [ 0, 0, 0, 1, 1, 1, 2, 2, 2];
        let posY: number[] = [ 0, 1, 2, 0, 1, 2, 0, 1, 2];

        let maskedSet: number[] = [ 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let num: number;
        let setCount: number = 0;

        do
        {

            let i = SudokuUtils.randomIntFromInterval(0, 8);

            if (maskedSet[ i ] == 0)
            {
                maskedSet[ i ] = 1;
                setCount++;
                // Mask each set

                let maskPos = SudokuUtils.randomIntFromInterval(minPos, maxPos);
                let j = 0;
                do
                {
                    let newPos = SudokuUtils.randomIntFromInterval(0, 8);
                    let x = this._setRowPosition[ i ] + posX[ newPos ];
                    let y = this._setColPosition[ i ] + posY[ newPos ];
                    if (this._problemSet[ x ][ y ] == 0)
                    {
                        this._problemSet[ x ][ y ] = this._numberSet[ x ][ y ];
                        j++;
                    }
                } while (j < maskPos);
            }
        } while (setCount < noOfSets);
    }

    // Driver code
    processSudoku(grid: number[][], diff: C.GameLevel)
    {

        if (this.fillSudoko(grid, 0, 0))
            this.print(grid);
        else
            console.log("No Solution exists");

        let minPos: number, maxPos: number, noOfSets: number;

        let difficulty: C.GameLevel = C.GameLevel.COMPLEX;
        this._numberSet = grid.map(o => [ ...o ]);

        switch (diff)
        {
            case C.GameLevel.SIMPLE:
            minPos = 4;
            maxPos = 6;
            noOfSets = 8;
            this.unMask(minPos, maxPos, noOfSets);
            break;
            case C.GameLevel.MEDIUM:
            minPos = 3; 
            maxPos = 5;
            noOfSets = 7;
            this.unMask(minPos, maxPos, noOfSets);
            break;
            case C.GameLevel.COMPLEX:
            minPos = 3;
            maxPos = 5;
            noOfSets = 6;
            this.unMask(minPos, maxPos, noOfSets);
            break;
        default:
            this.unMask(3, 6, 7);
            break;
        }
        this.print(this._problemSet);
        return this._problemSet
        // if(this.solveSudoko(grid, 0, 0))
        //     this.print(grid);
        // else
        //     console.log("No Solution exists");
    }
}

// This code is contributed by divyesh072019.
