import { CellModel } from "./cell-model";
import { blockLoopMax, blockSize } from "./constants";
import { SudokuUtils } from "./sudoku-utils";

export class Validate
{
    validate(arry: CellModel[])
    {
        let checkArr = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

        //for each array of 9 CellModels
        //mark duplicate numbers
        for (let j = 0; j <= blockLoopMax; j++)
        {
            let cell = arry[ j ];

            if (cell.value !== "")
            {
                checkArr[ +cell.value ]++;
            }

            if (cell.startValue !== "")
            {
                checkArr[ +cell.startValue ]++;
            }
        }

        checkArr.forEach((value, index) =>
        {
            if (index === 0) return; //ignore 0 value, only 1-9

            if (value > 1)
            {
                for (let i = 0; i <= blockLoopMax; i++)
                {
                    let cell = arry[ i ];
                    if (cell.value === '' + index || cell.startValue === '' + index)
                    {
                        cell.isError = true;
                    }
                }
            }
        });

        checkArr = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    }

    validateCells(sudoku: CellModel[]): void
    {
        let blockTemp = new Array();
        for (let block = 0; block <= blockLoopMax; block++)
        {
            for (let i = 0; i <= blockLoopMax; i++)
            {
                let offset = SudokuUtils.getOffsets(block, i);
                blockTemp[ i ] = sudoku[ offset.col + offset.row ];
            }

            this.validate(blockTemp);
        }

        //this.validate(this.cellValArray);
    }

    validateRows(sudoku: CellModel[]): void
    {
        let a = [];
        for (let i = 0; i < blockSize; i++)
        {
            let st = i * blockSize;
            let en = st + blockSize;
            a.push(sudoku.slice(st, en));
        }

        a.forEach((arry, idx) =>
        {
            this.validate(arry);
        });
    }

    validateCols(sudoku: CellModel[]): void
    {
        //reverse row/cols
        let a = [];
        for (let i = 0; i < blockSize; i++)
        {
            let st = i * blockSize;
            let en = st + blockSize;
            a.push(sudoku.slice(st, en));
        }
        let cols = this.transpose(a);

        cols.forEach((arry, idx) =>
        {
            this.validate(arry);
        });
    }

    transpose(matrix)
    {
        return matrix[ 0 ].map((col, i) => matrix.map(row => row[ i ]));
    }
}