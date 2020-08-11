import { saveVersion } from './environment';
import { bindable } from 'aurelia';
import { Validate } from './validate';
import { CellModel } from './cell-model';
import { SudokuUtils } from './sudoku-utils';
import { Key } from 'ts-key-enum';
import * as alerty from "alerty/dist/js/alerty.js";
import { blockSize, blockRowMax, blockColMax, blockLoopMax, sudokuLoopSize, sudokuSize, boardSize, initialWidth, initialHeight, positionTopLeft } from './constants';
import { Action } from './action';

export class Sudoku
{
    //current selected cell - presets
    prevPos: number = positionTopLeft;
    currPos: number = positionTopLeft;

    boardSize = boardSize; //use to make enum visible to view
    @bindable selectedSize: number = boardSize.medium;

    rngValue: number = .5;

    isRowHint: boolean = false;
    isCellHint: boolean = false;

    editingText = "";
    eventListener: void;
    myKeypressCallback: (e: any) => void = null;
    isEdit: boolean = false;
    isDirty: boolean = false;
    doesSaveExist: boolean = false;
    sudoku: CellModel[] = [];
    sudokuFull: number[] = [];
    history: Action[] = [];

    private readonly lsSaveName = "AU2.Sudoku.save";
    customCss: string;

    constructor(private sudokuUtils: SudokuUtils, private validate: Validate)
    {
        this.clearSudoku();
    }

    beforeAttach()
    {
        this.setEventSubscribers();
    }

    afterAttach()
    {
        this.checkSaveExist();
        this.markSelectedCell(this.prevPos, this.currPos);
        this.selectedSizeChanged();
    }

    beforeDetach()
    {
        this.removeEventSubscribers();
    }

    //
    // keyboard capture
    //
    setEventSubscribers(): void
    {
        //only set once
        if (this.myKeypressCallback) return;

        this.myKeypressCallback = e =>
        {
            this.handleKey(e);
        };
        document.addEventListener('keydown', this.myKeypressCallback, { capture: true });
    }

    removeEventSubscribers(): void
    {
        if (!this.myKeypressCallback) return;

        document.removeEventListener('keydown', this.myKeypressCallback);
        this.myKeypressCallback = null;
    }

    selectedSizeChanged()
    {
        let width = Math.floor(initialWidth * this.selectedSize);

        this.customCss = `width: ${width}px;height: fit-content;`;
    }

    resetSudokuHistory()
    {
        this.history = [];
    }

    updateHistory(action: Action)
    {
        if (this.history.length !== 0) 
        {
            let last = this.history[ this.history.length-1 ];
            if (last.position === action.position && last.newValue === action.newValue && last.oldValue === action.oldValue)
                return;
        }

        this.history.push(action);
    }

    unDo()
    {
        if (this.history.length !== 0) 
        {
            let last = this.history[ this.history.length - 1 ];
            if (last)
            {
                let v = last.oldValue === 0 ? "" : "" + last.oldValue;
                this.sudoku[last.position].value = v;
                this.history.pop();
            }
            
            this.doValidation();
        }
    }

    clearSudoku()
    {
        //Init values
        this.sudoku = [];
        this.prevPos = positionTopLeft;
        this.currPos = positionTopLeft;

        for (let i = 0; i <= sudokuLoopSize; i++)
        {
            this.sudoku.push(new CellModel())
        }
        this.markSelectedCell(this.prevPos, this.currPos);
        this.resetSudokuErrors();
        this.resetSudokuHistory();
    }

    generateSudoku()
    {
        this.isDirty = true;
        this.clearSudoku();

        this.sudokuUtils.generate();
        this.sudokuFull = this.sudokuUtils.sudoku;
        this.sudokuUtils.sudoku.forEach((v, i) =>
        {
            //console.log(v, i);
            if (Math.random() <= this.rngValue)
            {
                this.sudoku[ i ].startValue = '' + v;
            }
            else
            {
                this.sudoku[ i ].startValue = '';
            }
        });
    }

    resetSudokuErrors(): void
    {
        for (let i = 0; i <= sudokuLoopSize; i++)
        {
            //get 3x3 data
            let cell = this.sudoku[ i ];
            cell.isError = false;
        }
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

    cellClicked(event: MouseEvent)
    {
        let el: any = event.currentTarget;
        let cell = el.dataset.cell;
        this.prevPos = this.currPos;
        this.currPos = cell;
        this.markSelectedCell(this.prevPos, this.currPos);
    }

    //had to change from delegate and data-* to trigger for ios
    //keypadClick(event)
    keypadClick(key)
    {
        //let el: any = event.currentTarget
        //let btn = el.activeElement;
        //let key = btn.dataset.key;
        switch (key)
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
                let ev = { altKey: false, shiftKey: this.isRowHint, ctrlKey: this.isCellHint, key: key, preventDefault: () => { } };
                this.handleKey(ev);
                break;
            case "r":
                this.isRowHint = !this.isRowHint;
                if (this.isRowHint) this.isCellHint = false;
                break;
            case "c":
                this.isCellHint = !this.isCellHint;
                if (this.isCellHint) this.isRowHint = false;
                break;
            case "s":
                this.sudoku[ this.currPos ].value = "" + this.sudokuFull[ this.currPos ];
                this.sudoku[ this.currPos ].showValue = "" + this.sudokuFull[ this.currPos ];
                this.doValidation();
                break;
            case "u":
            case "Backspace":
                this.unDo();
                break;
            default:
                break;
        }
    }

    handleKey(event)
    {
        //console.log("handleKey", event);
        let modifier = 0;
        let wasHandled = false;

        modifier = event.altKey ? 1 : modifier;
        modifier = event.shiftKey ? 2 : modifier;
        modifier = event.ctrlKey ? 3 : modifier;

        //ignore if key is a modifier
        if (event.key === "Shift" || event.key === "Control" || event.key === "Alt") 
        {
            return;
        }

        if (!"0123456789".includes(event.key))
        {
            switch (event.code)
            {
                case Key.ArrowUp:
                case Key.ArrowDown:
                case Key.ArrowLeft:
                case Key.ArrowRight:
                    this.moveCellSelection(event.key);
                    wasHandled = true;
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
                    wasHandled = true;
                    break;
                case "Backspace":
                    this.unDo();
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
                    wasHandled = true;
                    break;
            }
        }

        // pass through to browser if not handled instead of eating all keys
        if (wasHandled)
        {
            event.preventDefault();
        }
    }

    cellInputKey(key, modifier): void
    {
        //console.log(key, modifier);
        //let cell = this.matrix.getCellModel(this.currRow, this.currCol);
        let cell = this.sudoku[ this.currPos ];

        if (key === "0") //clear values
        {
            //if revealed, cannot clear
            if (cell.showValue !== "") return;
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
                        let a = new Action(this.currPos, +cell.value, 0);
                        this.updateHistory(a);
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
                        //if revealed, cannot set to another value
                        if (cell.showValue !== "") return;
                        if (cell.value === key)
                        {
                            cell.value = "";
                        }
                        else
                        {
                            let a = new Action(this.currPos, +cell.value, +key);
                            this.updateHistory(a);

                            cell.value = key;
                        }
                    }
                    break;
            }

            this.doValidation();
        }
    }

    doValidation()
    {
        this.isDirty = true;
        this.resetSudokuErrors();
        this.validate.validateRows(this.sudoku);
        this.validate.validateCols(this.sudoku);
        this.validate.validateCells(this.sudoku);

        let checkSolved = this.sudoku.map((e) =>
        {
            let v = e.value;
            let s = e.startValue;
            return e.value !== "" ? +e.value : +e.startValue;
        });

        if (this.sudokuUtils.isSolvedSudoku(checkSolved))
        {
            alerty.alert("<h1>Congratulations!</h1>", {
                title: 'Success',
                okLabel: 'Ok'
            });
        }
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
        this.prevPos = this.currPos;

        switch (key)
        {
            case "ArrowUp":
                this.moveUp();
                break;
            case "ArrowDown":
                this.moveDown();
                break;
            case "ArrowLeft":
                this.moveLeft();
                break;
            case "ArrowRight":
                this.moveRight();
                break;
            default:
                return;
        }
    }

    moveDown()
    {
        let pos = this.currPos;
        pos = pos + blockSize;
        if (pos > sudokuLoopSize)
        {
            pos = pos - sudokuSize;
        }
        this.currPos = pos;
        this.markSelectedCell(this.prevPos, this.currPos);
    }

    moveUp()
    {
        let pos = this.currPos;
        pos = pos - blockSize;
        if (pos < 0)
        {
            pos = sudokuSize + pos;
        }
        this.currPos = pos;
        this.markSelectedCell(this.prevPos, this.currPos);
    }

    moveRight()
    {
        let pos = this.currPos;
        let row = SudokuUtils.returnRow(pos);
        let rowCol = pos % blockSize;
        rowCol = (rowCol + 1) % blockSize;
        this.currPos = row * blockSize + rowCol;
        this.markSelectedCell(this.prevPos, this.currPos);
    }

    moveLeft()
    {
        let pos = this.currPos;
        let row = SudokuUtils.returnRow(pos);
        let rowCol = pos % blockSize;
        if (rowCol === 0)
        {
            rowCol = blockSize - 1;
        }
        else
        {
            rowCol = (rowCol - 1);
        }
        this.currPos = row * blockSize + rowCol;
        this.markSelectedCell(this.prevPos, this.currPos);
    }

    markSelectedCell(prevPos: number, newPos: number): void
    {
        let model = this.sudoku[ prevPos ];
        model.isSelected = false;
        this.sudoku.splice(prevPos, 1, model);

        model = this.sudoku[ newPos ];
        model.isSelected = true;
        this.sudoku.splice(newPos, 1, model);
    }

    allowNewOverwrite(): boolean
    {
        if (this.isDirty)
        {
            alerty.confirm("This will overwrite any changes. Are you sure?", { okLabel: 'Ok', cancelLabel: 'Cancel' }, () => this.newOk(), () => this.newCancel());
            return;
        }

        this.generateSudoku();
    }

    newOk()
    {
        this.generateSudoku();
    }

    newCancel()
    {
        alerty.toast("Genertate New Cancelled");
    }

    allowLoadOverwrite(): boolean
    {
        if (this.isDirty)
        {
            alerty.confirm("This will overwrite any changes. Are you sure?", { okLabel: 'Ok', cancelLabel: 'Cancel' }, () => this.loadOk(), () => this.loadCancel());
            return;
        }

        this.loadSaveData();
    }

    loadOk()
    {
        this.loadSaveData();
    }

    loadCancel()
    {
        alerty.toast("Load Cancelled");
    }


    allowSaveOverwrite()
    {
        let json = localStorage.getItem(this.lsSaveName);
        if (json !== null)
        {
            alerty.confirm("This will overwrite your current save data, are you sure?", { okLabel: 'Ok', cancelLabel: 'Cancel' }, () => this.saveOk(), () => this.saveCancel());
            return;
        }

        this.saveData();
    }

    saveOk()
    {
        this.saveData();
    }

    saveCancel()
    {
        alerty.toast("Save Cancelled");
    }

    checkSaveExist()
    {
        let json = localStorage.getItem(this.lsSaveName);

        if (json === null) this.doesSaveExist = false;

        let save = JSON.parse(json);
        if (!save || save.version !== saveVersion) this.doesSaveExist = false;

        this.doesSaveExist = true;
    }

    saveData(): void
    {
        let json: string = JSON.stringify({ version: saveVersion, data: this.sudoku, full: this.sudokuFull });
        localStorage.setItem(this.lsSaveName, json);
        alerty.toasts("Saved");
    }

    versionMismatchOk()
    {
        localStorage.setItem(this.lsSaveName, null);
    }

    loadSaveData(): void
    {
        this.isDirty = true;
        let json = localStorage.getItem(this.lsSaveName);

        if (json === null) return;

        let save = JSON.parse(json);
        if (!save || save.version !== saveVersion) 
        {
            alerty.alert("Version mismatch, unable to load the previous save.", { okLabel: 'Ok' }, () => this.versionMismatchOk());
            return;
        }
        // if (!json)
        // {
        //     alerty.toasts("There is no save to load.");
        //     return;
        // }

        this.clearSudoku();

        this.sudokuFull = save.full;
        let matrix: CellModel[] = save.data;

        matrix.forEach((e: CellModel, idx: number) =>
        {
            Object.setPrototypeOf(e, CellModel.prototype);
            this.sudoku.splice(idx, 1, e);
            if (idx == 0)
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
