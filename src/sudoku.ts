import { Hints } from './hints';
import { KeyInput } from './key-input';
import { MoveCellSelection } from './move-cell-selection';
import { LoadSaveUtils } from './load-save';

import { bindable } from 'aurelia';
import { Validate } from './validate';
import { CellModel } from './cell-model';
import { SudokuUtils } from './sudoku-utils';
import * as alerty from "alerty/dist/js/alerty.js";
import { sudokuLoopSize, boardSize, initialWidth, positionTopLeft } from './constants';
import { Action } from './action';
import { Position } from './position';

export class Sudoku
{
    eventListener: void;
    myKeypressCallback: (e: any) => void = null;

    //current selected cell - presets
    position = new Position(positionTopLeft, positionTopLeft);
    hints: Hints = new Hints(false, false);

    boardSize = boardSize; //use to make enum visible to view
    @bindable selectedSize: number = boardSize.medium;

    //starting difficulty setting
    rngValue: number = .5;
    
    editingText = "";
    isEdit: boolean = false;
    isDirty: boolean = false;
    sudoku: CellModel[] = [];
    sudokuFull: number[] = [];
    history: Action[] = [];

    saveExists: boolean = false;
    customCss: string;

    constructor(
        private sudokuUtils: SudokuUtils, 
        private validate: Validate, 
        private loadSaveUtils: LoadSaveUtils, 
        private inputMove: MoveCellSelection,
        private keyInput: KeyInput)
    {
        this.saveExists = this.loadSaveUtils.doesSaveExist();
        this.clearSudoku();
    }

    beforeAttach()
    {
        this.setEventSubscribers();
    }

    afterAttach()
    {
        this.inputMove.markSelectedCell(this.sudoku, this.position);
        this.selectedSizeChanged();
    }

    beforeDetach()
    {
        this.removeEventSubscribers();
    }

    // keyboard capture
    setEventSubscribers(): void
    {
        if (this.myKeypressCallback) return;

        this.myKeypressCallback = e =>
        {
            this.keyInput.handleKey(e, this.sudoku, this.position, this.inputMove, this.isEdit);
            this.doValidation();
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

    clearSudoku()
    {
        //Init values
        this.sudoku = [];
        this.position.prevPos = positionTopLeft;
        this.position.currPos = positionTopLeft;

        for (let i = 0; i <= sudokuLoopSize; i++)
        {
            this.sudoku.push(new CellModel())
        }
        this.inputMove.markSelectedCell(this.sudoku, this.position);
        this.resetSudokuErrors();
        this.keyInput.resetSudokuHistory();
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
        this.position.prevPos = this.position.currPos;
        this.position.currPos = cell;
        this.inputMove.markSelectedCell(this.sudoku, this.position);
    }

    //had to change from delegate and data-* to trigger for ios
    //keypadClick(event)
    keypadClick(key)
    {
        this.keyInput.keypadHandler(key, this.sudoku, this.sudokuFull, this.position, this.inputMove, this.isEdit, this.hints);
        this.doValidation();
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

        this.loadOk();
    }

    loadOk()
    {
        this.clearSudoku();
        this.loadSaveUtils.loadSaveData(this.sudoku, this.sudokuFull);
        this.doValidation();
    }

    loadCancel()
    {
        alerty.toast("Load Cancelled");
    }

    allowSaveOverwrite(): boolean
    {
        let exists = this.loadSaveUtils.doesSaveExist();
        if (exists)
        {
            alerty.confirm("This will overwrite your current save data, are you sure?", { okLabel: 'Ok', cancelLabel: 'Cancel' }, () => this.saveOk(), () => this.saveCancel());
            return;
        }

        this.loadSaveUtils.saveData(this.sudoku, this.sudokuFull);
    }

    saveOk()
    {
        this.loadSaveUtils.saveData(this.sudoku, this.sudokuFull);
    }

    saveCancel()
    {
        alerty.toast("Save Cancelled");
    }
}
