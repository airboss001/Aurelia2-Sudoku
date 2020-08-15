import { MoveCellSelection } from './move-cell-selection';
import { Key } from 'ts-key-enum';
import { CellModel } from './cell-model';
import { Position } from './position';
import { Action } from './action';

export class KeyInput
{
    history: Action[] = [];

    isRowHint: boolean = false;
    isCellHint: boolean = false;

    keypadHandler(key, sudoku, sudokuFull, position, inputMove, isEdit, hints)
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
                let ev = { altKey: false, shiftKey: hints.isRowHint, ctrlKey: hints.isCellHint, key: key, preventDefault: () => { } };
                this.handleKey(ev, sudoku, position, inputMove, isEdit);
                break;
            case "r":
                hints.isRowHint = !hints.isRowHint;
                if (hints.isRowHint) hints.isCellHint = false;
                break;
            case "c":
                hints.isCellHint = !hints.isCellHint;
                if (hints.isCellHint) hints.isRowHint = false;
                break;
            case "s":
                sudoku[ position.currPos ].value = "" + sudokuFull[ position.currPos ];
                sudoku[ position.currPos ].showValue = "" + sudokuFull[ position.currPos ];
                break;
            case "u":
            case "Backspace":
                this.unDo(sudoku);
                break;
            default:
                break;
        }
    }

    handleKey(event, sudoku: CellModel[], position: Position, inputMove: MoveCellSelection, isEdit: boolean)
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
                    inputMove.moveCellSelection(sudoku, event.key, position);
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
                    this.cellInputKey(sudoku, position, event.code.substring(event.code.length - 1, event.code.length), modifier, isEdit);
                    wasHandled = true;
                    break;
                case "Backspace":
                    this.unDo(sudoku);
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
                    this.cellInputKey(sudoku, position, event.key, modifier, isEdit);
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

    cellInputKey(sudoku: CellModel[], position: Position, key, modifier, isEdit: boolean): void
    {
        //console.log(key, modifier);
        //let cell = this.matrix.getCellModel(this.currRow, this.currCol);
        let cell = sudoku[ position.currPos ];

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
                    if (isEdit)
                    {
                        cell.startValue = "";
                    }
                    else
                    {
                        let a = new Action(position.currPos, +cell.value, 0);
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
                    if (isEdit)
                    {
                        if (isEdit && cell.startValue === key)
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
                            let a = new Action(position.currPos, +cell.value, +key);
                            this.updateHistory(a);

                            cell.value = key;
                        }
                    }
                    break;
            }

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

    resetSudokuHistory()
    {
        this.history = [];
    }

    updateHistory(action: Action)
    {
        if (this.history.length !== 0) 
        {
            let last = this.history[ this.history.length - 1 ];
            if (last.position === action.position && last.newValue === action.newValue && last.oldValue === action.oldValue)
                return;
        }

        this.history.push(action);
    }

    unDo(sudoku: CellModel[])
    {
        if (this.history.length !== 0) 
        {
            let last = this.history[ this.history.length - 1 ];
            if (last)
            {
                let v = last.oldValue === 0 ? "" : "" + last.oldValue;
                sudoku[ last.position ].value = v;
                this.history.pop();
            }
        }
    }

}