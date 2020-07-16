import { CellModel } from "./cell-model";
import * as alerty from "alerty/dist/js/alerty.js";

export const cellRowMax: number = 9;
export const cellColMax: number = 9;
export const cellMax: number = 9;

export class SudokuMatrix
{
    cellRowCol: CellModel[][];
    rowValArray: CellModel[][] = [];
    colValArray: CellModel[][] = [];
    cellValArray: CellModel[][] = [];

    private readonly lsSaveName = "AU2.Sudoku.save";

    constructor()
    {
        this.cellRowCol = this.createMatrix();
        this.createValidationArrays();
    }

    getCellModel(row: number, col: number): CellModel
    {
        return this.cellRowCol[ row ][ col ];
    }

    markSelectedCell(prevRow: number, prevCol: number, newRow: number, newCol: number): void
    {
        let arry = this.cellRowCol[ prevRow ];
        let model = arry[ prevCol ];
        model.isSelected = false;
        arry.splice(prevCol, 1, model);

        arry = this.cellRowCol[ newRow ];
        model = arry[ newCol ];
        model.isSelected = true;
        arry.splice(newCol, 1, model);
    }

    resetErrors(): void
    {
        for (let i = 1; i <= cellMax; i++)
        {
            //get 3x3 data
            let cell = this.cellRowCol[ i ];

            //mark duplicate numbers
            for (let j = 1; j <= cellMax; j++)
            {
                cell[ j ].isError = false;
            }
        }
    }

    setTestData(): void
    {
        for (let i = 1; i < cellRowMax + 1; i++)
        {
            for (let j = 1; j < cellColMax + 1; j++)
            {
                let model = this.cellRowCol[ i ][ j ];
                model.isSelected = false;
                model.cellHints = j.toString();
                model.value = '' + j;
                model.rowHints = "123456789";
            }
        }
    }

    sampleData(): void
    {
    }

    loadSampleData(): void
    {
        let data =
            `-67----3-
1----67--
--9237--6
2---658--
3--7---1-
-98-2---5
6-1-4----
-4----6-1
---61---3`;

        this.loadStringData(data);
        alerty.toasts("Sample Loaded...");
    }

    loadStringData(data: string): void
    {
        let pData = data.split('\n')
        if (pData.length !== 9)
        {
            console.log("Error in data format, invalid number of rows.")
            return;
        }
        let matrix = [];
        for (let i = 0; i < 9; i++)
        {
            let v = pData[ i ];
            let arr = v.split("");
            if (arr.length !== 9)
            {
                console.log(`Error in data format, invalid number of columns, row ${i + 1}.`)
                return;
            }
            matrix[ i ] = arr;
        }

        //console.log("loaded matrix", matrix)

        for (let i = 1; i < cellRowMax + 1; i++)
        {
            for (let j = 1; j < cellColMax + 1; j++)
            {
                let model = this.cellRowCol[ i ][ j ];
                model.startValue = matrix[ i - 1 ][ j - 1 ] !== '-' ? matrix[ i - 1 ][ j - 1 ] : "";
                //model.isSelected = false;
                model.cellHints = "";
                model.value = "";
                model.rowHints = "";
            }
        }
    }

    allowSaveOverwrite()
    {
        let json = localStorage.getItem(this.lsSaveName);
        if (json !== null)
        {
            if (!confirm("This will overwrite your current save data, are you sure?"))
                return false;
        }

        return true;
    }
    saveMatrixToLocalstorage(): void
    {
        this.allowSaveOverwrite();

        let json = localStorage.getItem(this.lsSaveName);

        json = JSON.stringify(this.cellRowCol);
        localStorage.setItem(this.lsSaveName, json);
        alerty.toasts("Saved");
    }

    loadLocalstorageToMatrix(): void
    {
        let json = localStorage.getItem(this.lsSaveName);

        if (!json)
        {
            alerty.toasts("There is no save to load.");
            return;
        }

        let matrix: CellModel[][] = JSON.parse(json);
        console.log("load matrix", matrix);

        for (let i = 1; i < cellRowMax + 1; i++)
        {
            for (let j = 1; j < cellColMax + 1; j++)
            {
                let model = this.cellRowCol[ i ][ j ];
                let smodel = matrix[ i ][ j ];
                Object.setPrototypeOf(smodel, CellModel.prototype);

                model.startValue = smodel.startValue;
                //model.isSelected = false;
                model.cellHints = smodel.cellHints;
                model.value = smodel.value;
                model.rowHints = smodel.rowHints;
            }
        }
        alerty.toasts("Load complete");
    }

    createMatrix(): CellModel[][]
    {
        let arrRows = [];

        //skip 0 index
        arrRows.push(undefined);
        for (let i = 1; i < cellRowMax + 1; i++)
        {
            let arrCols = [];
            //skip 0 index
            arrCols.push(undefined);
            for (let j = 1; j < cellColMax + 1; j++)
            {
                arrCols.push(new CellModel());
            }

            arrRows.push(arrCols);
        }

        return arrRows;
    }

    createValidationArrays(): void
    {
        //rows
        this.colValArray[ 1 ] = this.cellRowCol[ 1 ];
        this.colValArray[ 2 ] = this.cellRowCol[ 2 ];
        this.colValArray[ 3 ] = this.cellRowCol[ 3 ];
        this.colValArray[ 4 ] = this.cellRowCol[ 4 ];
        this.colValArray[ 5 ] = this.cellRowCol[ 5 ];
        this.colValArray[ 6 ] = this.cellRowCol[ 6 ];
        this.colValArray[ 7 ] = this.cellRowCol[ 7 ];
        this.colValArray[ 8 ] = this.cellRowCol[ 8 ];
        this.colValArray[ 9 ] = this.cellRowCol[ 9 ];

        //cols
        for (let iCol = 1; iCol < 10; iCol++)
        {
            let colArr = [];
            for (let iRow = 1; iRow < 10; iRow++)
            {
                colArr[ iRow ] = this.cellRowCol[ iRow ][ iCol ];
            }
            this.rowValArray[ iCol ] = colArr;
        }

        //cells
        let cellArr1 = [];
        let cellArr2 = [];
        let cellArr3 = [];

        cellArr1[ 1 ] = this.cellRowCol[ 1 ][ 1 ];
        cellArr1[ 2 ] = this.cellRowCol[ 1 ][ 2 ];
        cellArr1[ 3 ] = this.cellRowCol[ 1 ][ 3 ];
        cellArr2[ 1 ] = this.cellRowCol[ 1 ][ 4 ];
        cellArr2[ 2 ] = this.cellRowCol[ 1 ][ 5 ];
        cellArr2[ 3 ] = this.cellRowCol[ 1 ][ 6 ];
        cellArr3[ 1 ] = this.cellRowCol[ 1 ][ 7 ];
        cellArr3[ 2 ] = this.cellRowCol[ 1 ][ 8 ];
        cellArr3[ 3 ] = this.cellRowCol[ 1 ][ 9 ];

        cellArr1[ 4 ] = this.cellRowCol[ 2 ][ 1 ];
        cellArr1[ 5 ] = this.cellRowCol[ 2 ][ 2 ];
        cellArr1[ 6 ] = this.cellRowCol[ 2 ][ 3 ];
        cellArr2[ 4 ] = this.cellRowCol[ 2 ][ 4 ];
        cellArr2[ 5 ] = this.cellRowCol[ 2 ][ 5 ];
        cellArr2[ 6 ] = this.cellRowCol[ 2 ][ 6 ];
        cellArr3[ 4 ] = this.cellRowCol[ 2 ][ 7 ];
        cellArr3[ 5 ] = this.cellRowCol[ 2 ][ 8 ];
        cellArr3[ 6 ] = this.cellRowCol[ 2 ][ 9 ];

        cellArr1[ 7 ] = this.cellRowCol[ 3 ][ 1 ];
        cellArr1[ 8 ] = this.cellRowCol[ 3 ][ 2 ];
        cellArr1[ 9 ] = this.cellRowCol[ 3 ][ 3 ];
        cellArr2[ 7 ] = this.cellRowCol[ 3 ][ 4 ];
        cellArr2[ 8 ] = this.cellRowCol[ 3 ][ 5 ];
        cellArr2[ 9 ] = this.cellRowCol[ 3 ][ 6 ];
        cellArr3[ 7 ] = this.cellRowCol[ 3 ][ 7 ];
        cellArr3[ 8 ] = this.cellRowCol[ 3 ][ 8 ];
        cellArr3[ 9 ] = this.cellRowCol[ 3 ][ 9 ];

        this.cellValArray[ 1 ] = cellArr1;
        this.cellValArray[ 2 ] = cellArr2;
        this.cellValArray[ 3 ] = cellArr3;

        cellArr1 = [];
        cellArr2 = [];
        cellArr3 = [];

        cellArr1[ 1 ] = this.cellRowCol[ 4 ][ 1 ];
        cellArr1[ 2 ] = this.cellRowCol[ 4 ][ 2 ];
        cellArr1[ 3 ] = this.cellRowCol[ 4 ][ 3 ];
        cellArr2[ 1 ] = this.cellRowCol[ 4 ][ 4 ];
        cellArr2[ 2 ] = this.cellRowCol[ 4 ][ 5 ];
        cellArr2[ 3 ] = this.cellRowCol[ 4 ][ 6 ];
        cellArr3[ 1 ] = this.cellRowCol[ 4 ][ 7 ];
        cellArr3[ 2 ] = this.cellRowCol[ 4 ][ 8 ];
        cellArr3[ 3 ] = this.cellRowCol[ 4 ][ 9 ];

        cellArr1[ 4 ] = this.cellRowCol[ 5 ][ 1 ];
        cellArr1[ 5 ] = this.cellRowCol[ 5 ][ 2 ];
        cellArr1[ 6 ] = this.cellRowCol[ 5 ][ 3 ];
        cellArr2[ 4 ] = this.cellRowCol[ 5 ][ 4 ];
        cellArr2[ 5 ] = this.cellRowCol[ 5 ][ 5 ];
        cellArr2[ 6 ] = this.cellRowCol[ 5 ][ 6 ];
        cellArr3[ 4 ] = this.cellRowCol[ 5 ][ 7 ];
        cellArr3[ 5 ] = this.cellRowCol[ 5 ][ 8 ];
        cellArr3[ 6 ] = this.cellRowCol[ 5 ][ 9 ];

        cellArr1[ 7 ] = this.cellRowCol[ 6 ][ 1 ];
        cellArr1[ 8 ] = this.cellRowCol[ 6 ][ 2 ];
        cellArr1[ 9 ] = this.cellRowCol[ 6 ][ 3 ];
        cellArr2[ 7 ] = this.cellRowCol[ 6 ][ 4 ];
        cellArr2[ 8 ] = this.cellRowCol[ 6 ][ 5 ];
        cellArr2[ 9 ] = this.cellRowCol[ 6 ][ 6 ];
        cellArr3[ 7 ] = this.cellRowCol[ 6 ][ 7 ];
        cellArr3[ 8 ] = this.cellRowCol[ 6 ][ 8 ];
        cellArr3[ 9 ] = this.cellRowCol[ 6 ][ 9 ];

        this.cellValArray[ 4 ] = cellArr1;
        this.cellValArray[ 5 ] = cellArr2;
        this.cellValArray[ 6 ] = cellArr3;

        cellArr1 = [];
        cellArr2 = [];
        cellArr3 = [];

        cellArr1[ 1 ] = this.cellRowCol[ 7 ][ 1 ];
        cellArr1[ 2 ] = this.cellRowCol[ 7 ][ 2 ];
        cellArr1[ 3 ] = this.cellRowCol[ 7 ][ 3 ];
        cellArr2[ 1 ] = this.cellRowCol[ 7 ][ 4 ];
        cellArr2[ 2 ] = this.cellRowCol[ 7 ][ 5 ];
        cellArr2[ 3 ] = this.cellRowCol[ 7 ][ 6 ];
        cellArr3[ 1 ] = this.cellRowCol[ 7 ][ 7 ];
        cellArr3[ 2 ] = this.cellRowCol[ 7 ][ 8 ];
        cellArr3[ 3 ] = this.cellRowCol[ 7 ][ 9 ];

        cellArr1[ 4 ] = this.cellRowCol[ 8 ][ 1 ];
        cellArr1[ 5 ] = this.cellRowCol[ 8 ][ 2 ];
        cellArr1[ 6 ] = this.cellRowCol[ 8 ][ 3 ];
        cellArr2[ 4 ] = this.cellRowCol[ 8 ][ 4 ];
        cellArr2[ 5 ] = this.cellRowCol[ 8 ][ 5 ];
        cellArr2[ 6 ] = this.cellRowCol[ 8 ][ 6 ];
        cellArr3[ 4 ] = this.cellRowCol[ 8 ][ 7 ];
        cellArr3[ 5 ] = this.cellRowCol[ 8 ][ 8 ];
        cellArr3[ 6 ] = this.cellRowCol[ 8 ][ 9 ];

        cellArr1[ 7 ] = this.cellRowCol[ 9 ][ 1 ];
        cellArr1[ 8 ] = this.cellRowCol[ 9 ][ 2 ];
        cellArr1[ 9 ] = this.cellRowCol[ 9 ][ 3 ];
        cellArr2[ 7 ] = this.cellRowCol[ 9 ][ 4 ];
        cellArr2[ 8 ] = this.cellRowCol[ 9 ][ 5 ];
        cellArr2[ 9 ] = this.cellRowCol[ 9 ][ 6 ];
        cellArr3[ 7 ] = this.cellRowCol[ 9 ][ 7 ];
        cellArr3[ 8 ] = this.cellRowCol[ 9 ][ 8 ];
        cellArr3[ 9 ] = this.cellRowCol[ 9 ][ 9 ];

        this.cellValArray[ 7 ] = cellArr1;
        this.cellValArray[ 8 ] = cellArr2;
        this.cellValArray[ 9 ] = cellArr3;
    }

    doMatrixValidation(): void
    {
        this.resetErrors();
        this.validateCells();
        this.validateRows();
        this.validateCols();

    }

    validate(arry: CellModel[][]): void
    {
        let checkArr = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

        //for each 3x3
        for (let i = 1; i <= cellMax; i++)
        {
            //get 3x3 data
            let cell = arry[ i ];

            //mark duplicate numbers
            for (let j = 1; j <= cellMax; j++)
            {
                if (cell[ j ].value !== "")
                {
                    checkArr[ +cell[ j ].value ]++;
                }
                if (cell[ j ].startValue !== "")
                {
                    checkArr[ +cell[ j ].startValue ]++;
                }
            }
            checkArr.forEach((value, index) =>
            {
                if (index === 0) return; //ignore 0
                if (value > 1)
                {
                    console.log("dup found", i, index, value);
                    cell.forEach((val, idx) =>
                    {
                        if (idx === 0) return; //ignore 0
                        if (val.value === '' + index || val.startValue === '' + index) cell[ idx ].isError = true;
                    })
                }
            });

            checkArr = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
        }
    }

    validateCells(): void
    {
        this.validate(this.cellValArray);
    }

    validateRows(): void
    {
        this.validate(this.rowValArray);
    }

    validateCols(): void
    {
        this.validate(this.colValArray);
    }
}