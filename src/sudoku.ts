import { CellModel } from './cell-model';
import { SudokuGenerator } from './sudoku-generator';
//import { SudokuMatrix, cellRowMax, cellColMax } from './matrix';
import { Key } from 'ts-key-enum';
import * as alerty from "alerty/dist/js/alerty.js";

export const cellRowMax: number = 8;
export const cellColMax: number = 8;
export const cellMax: number = 8;
export class Sudoku
{
    //current selected cell - presets
    prevRow: number = 0;
    prevCol: number = 0;
    currRow: number = 0;
    currCol: number = 0;

    public editingText = "";
    eventListener: void;
    myKeypressCallback: (e: any) => void = null;
    isEdit: boolean = false;
    isDirty: boolean = false;
    sudoku: CellModel[] = [];

    private readonly lsSaveName = "AU2.Sudoku.save";

    constructor(private sudokuGenerator: SudokuGenerator)
    {
        this.clearSudoku();
    }

    clearSudoku()
    {
        //Init values
        this.sudoku = [];
        this.prevRow = 0;
        this.prevCol = 0;
        this.currRow = 0;
        this.currCol = 0;

        for (let i = 0; i < 81; i++)
        {
            this.sudoku.push(new CellModel())
        }
        this.markSelectedCell(0, 0, 0, 0);
        this.resetErrors();
    }
    
    beforeAttach()
    {
        //only set once
        if (this.myKeypressCallback) return;

        this.myKeypressCallback = e =>
        {
            this.handleKey(e);
        };
        this.setSubscribers();
    }

    afterAttach()
    {
        this.markSelectedCell(0, 0, 0, 0);
    }

    beforeDetach()
    {
        this.removeSubscribers();
    }

    setSubscribers(): void
    {
        document.addEventListener('keydown', this.myKeypressCallback, { capture: true });
    }

    removeSubscribers(): void
    {
        if (!this.myKeypressCallback) return;

        document.removeEventListener('keydown', this.myKeypressCallback);
        this.myKeypressCallback = null;
    }

    generateSudoku()
    {
        if (!this.allowOverwrite()) return;

        this.clearSudoku();

        this.sudokuGenerator.generate();
        this.sudokuGenerator.sudoku.forEach((v, i) =>
        {
            console.log(v, i);
            if (Math.random() > .5)
            {
                this.sudoku[ i ].startValue = '' + v;
            }
            else
            {
                this.sudoku[ i ].startValue = '';
            }
        });
    }

    doEdit(): void
    {
        if (this.isEdit)
        {
            this.isEdit = false;
            this.editingText = "";
        }
        else
        {
            this.isEdit = true;
            this.editingText = "- Editing"
        }
    }

    handleKey(event)
    {
        //console.log("handleKey", event);
        let modifier = 0;
        modifier = event.altKey ? 1 : modifier;
        modifier = event.shiftKey ? 2 : modifier;
        modifier = event.ctrlKey ? 3 : modifier;

        if (!"0123456789".includes(event.key))
        {
            switch (event.code)
            {
                case Key.ArrowUp:
                case Key.ArrowDown:
                case Key.ArrowLeft:
                case Key.ArrowRight:
                    this.moveCellSelection(event.key);
                    break;
                case "Digit0":
                case "Digit1":
                case "Digit2":
                case "Digit3":
                case "Digit4":
                case "Digit5":
                case "Digit6":
                case "Digit7":
                case "Digit8":
                case "Digit9":
                    this.cellInputKey(event.code.substring(event.code.length - 1, event.code.length), modifier);
                    break;
                case "Numpad0":
                case "Numpad1":
                case "Numpad2":
                case "Numpad3":
                case "Numpad4":
                case "Numpad5":
                case "Numpad6":
                case "Numpad7":
                case "Numpad8":
                case "Numpad9":
                    this.cellInputKey(event.code.substring(event.code.length - 1, event.code.length), modifier);
                    break;
            }
        }
        else
        {
            switch (event.key)
            {
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    this.cellInputKey(event.key, modifier);
                    break;
            }
        }
        event.preventDefault();
    }

    cellInputKey(key, modifier): void
    {
        //console.log(key, modifier);
        //let cell = this.matrix.getCellModel(this.currRow, this.currCol);
        let cell = this.sudoku[ (9 * this.currRow) + this.currCol ];

        if (key === "0") //clear values
        {
            switch (modifier)
            {
                case 1: // alt clear
                    break;
                case 2: //shft set row hint
                    cell.rowHints = "";
                    break;
                case 3: //ctrl set cell hint
                    cell.cellHints = "";
                    break;
                default: //none set value
                    if (this.isEdit)
                    {
                        cell.startValue = "";
                    }
                    else
                    {
                        cell.value = "";
                    }
                    break;
            }
        }
        else
        {
            switch (modifier)
            {
                case 1: // alt clear
                    break;
                case 2: //shft set row hint
                    cell.rowHints = this.addRemoveKey(cell.rowHints, key);
                    break;
                case 3: //ctrl set cell hint
                    cell.cellHints = this.addRemoveKey(cell.cellHints, key);
                    break;
                default: //none set value
                    if (this.isEdit)
                    {
                        if (this.isEdit && cell.startValue === key)
                        {
                            cell.startValue = "";
                        }
                        else
                        {
                            cell.startValue = key;
                        }
                    }
                    else
                    {
                        if (cell.value === key)
                        {
                            cell.value = "";
                        }
                        else
                        {
                            cell.value = key;
                        }
                    }
                    break;
            }

            this.isDirty = true;
            this.resetErrors();
            this.validateRows();
            this.validateCols();
            this.validateCells();

            let checkSolved = this.sudoku.map((e) => {
                let v = e.value;
                let s = e.startValue;
                return e.value !== "" ? +e.value : +e.startValue;
            });
            if (this.sudokuGenerator.isSolvedSudoku(checkSolved))
            {
                alerty.alert("<h1>Congratulations!</h1>", {
                    title: 'Success',
                    okLabel: 'Ok'
                });
            }
        }
    }

    resetErrors(): void
    {
        for (let i = 0; i <= 80; i++)
        {
            //get 3x3 data
            let cell = this.sudoku[ i ];
            cell.isError = false;
        }
    }

    validate(arry: CellModel[])
    {
        let checkArr = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];

        //for each array of 9 CellModels
        //mark duplicate numbers
        for (let j = 0; j <= cellMax; j++)
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
                console.log("dup found", index, value);
                for (let i = 0; i <= 8; i++)
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

    validateCells(): void
    {
        let blockTemp = new Array();
        for (let block = 0; block <= 8; block++)
        {
            for (let i = 0; i <= 8; i++)
            {
                let offset = this.sudokuGenerator.getOffsets(block, i);
                blockTemp[ i ] = this.sudoku[ offset.col + offset.row ];
            }

            this.validate(blockTemp);
        }

        //this.validate(this.cellValArray);
    }

    validateRows(): void
    {
        let a = [];
        for (let i = 0; i < 9; i++)
        {
            let st = i * 9;
            let en = st + 9;
            a.push(this.sudoku.slice(st, en));
        }

        a.forEach((arry, idx) =>
        {
            console.log("Row: ", idx);
            this.validate(arry);
        });
    }

    validateCols(): void
    {
        //reverse row/cols
        let a = [];
        for (let i = 0; i < 9; i++)
        {
            let st = i * 9;
            let en = st + 9;
            a.push(this.sudoku.slice(st, en));
        }
        let cols = this.transpose(a);

        cols.forEach((arry, idx) =>
        {
            console.log("Col: ", idx);
            this.validate(arry);
        });
    }

    transpose(matrix)
    {
        return matrix[ 0 ].map((col, i) => matrix.map(row => row[ i ]));
    }

    addRemoveKey(oldHints: string, key: string): string
    {
        let hints: string = oldHints;
        if (hints.includes(key))
        {
            hints = hints.replace(key, "");
        }
        else
        {
            let hintsArr = hints != null ? (hints + key).split("") : [];
            hints = this.getSortedUnique(hintsArr);
        }

        return hints;
    }

    //prevent hint duplicates
    getSortedUnique(arr): string
    {
        let narr = arr;
        narr = narr.sort(function (a, b)
        {
            return (a).localeCompare(b);
        });
        let os = new Set(narr);

        return Array.from(os).join("");
    }

    moveCellSelection(key): void
    {
        this.prevRow = this.currRow;
        this.prevCol = this.currCol;

        switch (key)
        {
            case "ArrowUp":
                if (this.currRow > 0) this.currRow--;
                else this.currRow = cellRowMax;
                break;
            case "ArrowDown":
                if (this.currRow < cellRowMax) this.currRow++;
                else this.currRow = 0;
                break;
            case "ArrowLeft":
                if (this.currCol > 0) this.currCol--;
                else this.currCol = cellColMax;
                break;
            case "ArrowRight":
                if (this.currCol < cellColMax) this.currCol++;
                else this.currCol = 0;
                break;
            default:
                return;
        }
        //this.matrix.markSelectedCell(this.prevRow, this.prevCol, this.currRow, this.currCol);
        this.markSelectedCell(this.prevRow, this.prevCol, this.currRow, this.currCol)
        // console.log("select move: ", this.prevRow, this.prevCol,
        //     "->", this.currRow, this.currCol);
    }

    markSelectedCell(prevRow: number, prevCol: number, newRow: number, newCol: number): void
    {
        let prevModelIndex = (9 * prevRow) + prevCol;
        let model = this.sudoku[ prevModelIndex ];
        model.isSelected = false;
        this.sudoku.splice(prevModelIndex, 1, model);

        let currModelIndex = (9 * newRow) + newCol;
        model = this.sudoku[ currModelIndex ];
        model.isSelected = true;
        this.sudoku.splice(currModelIndex, 1, model);
    }

    allowOverwrite(): boolean
    {
        if (this.isDirty)
        {
            if (!confirm("This will overwrite any changes. Are you sure?")) 
            {
                return false;
            }
        }

        return true;
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

    saveData(): void
    {
        this.allowSaveOverwrite();

        let json = localStorage.getItem(this.lsSaveName);

        json = JSON.stringify(this.sudoku);
        localStorage.setItem(this.lsSaveName, json);
        alerty.toasts("Saved");
    }

    loadSaveData(): void
    {
        if (!this.allowOverwrite()) return;

        //this.matrix.loadLocalstorageToMatrix();
        this.isDirty = true;
        let json = localStorage.getItem(this.lsSaveName);

        if (!json)
        {
            alerty.toasts("There is no save to load.");
            return;
        }

        let matrix: CellModel[] = JSON.parse(json);
        console.log("load matrix", matrix);

        this.clearSudoku();

        matrix.forEach((e: CellModel, idx: number) =>
        {
            Object.setPrototypeOf(e, CellModel.prototype);
            this.sudoku.splice(idx, 1, e);
            if(idx == 0)
            {
                e.isSelected = true;
            }
            else
            {
                e.isSelected = false;
            }
        });

        alerty.toasts("Load complete");
    }
}
