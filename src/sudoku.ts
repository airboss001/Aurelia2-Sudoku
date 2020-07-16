import { SudokuMatrix, cellRowMax, cellColMax } from './matrix';
import { Key } from 'ts-key-enum';

export class Sudoku
{
    //current selected cell - presets
    prevRow: number = 1;
    prevCol: number = 1;
    currRow: number = 1;
    currCol: number = 1;

    public editingText = "";
    eventListener: void;
    myKeypressCallback: (e: any) => void = null;
    isEdit: boolean = false;
    isDirty: boolean = false;

    constructor(private matrix: SudokuMatrix)
    {
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
        this.matrix.markSelectedCell(1, 1, 1, 1);
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
        let cell = this.matrix.getCellModel(this.currRow, this.currCol);

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
            this.matrix.doMatrixValidation();
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
        this.prevRow = this.currRow;
        this.prevCol = this.currCol;

        switch (key)
        {
            case "ArrowUp":
                if (this.currRow > 1) this.currRow--;
                else this.currRow = cellRowMax;
                break;
            case "ArrowDown":
                if (this.currRow < cellRowMax) this.currRow++;
                else this.currRow = 1;
                break;
            case "ArrowLeft":
                if (this.currCol > 1) this.currCol--;
                else this.currCol = cellColMax;
                break;
            case "ArrowRight":
                if (this.currCol < cellColMax) this.currCol++;
                else this.currCol = 1;
                break;
            default:
                return;
        }
        this.matrix.markSelectedCell(this.prevRow, this.prevCol, this.currRow, this.currCol);

        // console.log("select move: ", this.prevRow, this.prevCol,
        //     "->", this.currRow, this.currCol);
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

    loadSampleData(): void
    {
        if(!this.allowOverwrite()) return;
        
        this.matrix.loadSampleData();
        this.isDirty = false;
    }

    saveData(): void
    {
        this.matrix.saveMatrixToLocalstorage();
    }

    loadSaveData(): void
    {
        if (!this.allowOverwrite()) return;

        this.matrix.loadLocalstorageToMatrix();
        this.isDirty = true;
    }
}
