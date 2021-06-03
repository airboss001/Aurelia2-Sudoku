import { Hints } from './hints';
import { KeyInput } from './key-input';
import { MoveCellSelection } from './move-cell-selection';
import { LoadSaveUtils } from './load-save';

import { bindable } from 'aurelia';
import { Validate } from './validate';
import { CellModel } from './cell-model';
import { SudokuGen2 } from './sudoku-gen2';
import * as alerty from "alerty/dist/js/alerty.js";
import { sudokuLoopSize, boardSize, GameLevel, initialWidth, positionTopLeft } from './constants';
import { Action } from './action';
import { Position } from './position';

export class Sudoku
{
    eventListener;
    myKeypressCallback: (e: any) => void = null;

    //current selected cell - presets
    position = new Position(positionTopLeft, positionTopLeft);
    hints: Hints = new Hints(false, false);

    boardSize = boardSize; //use to make enum visible to view
    gameLevel = GameLevel; //use to make enum visible to view

    @bindable selectedSize: number = boardSize.medium;
    @bindable selectedDiff: number = GameLevel.SIMPLE;

    editingText = "";
    isEdit: boolean = false;
    isDirty: boolean = false;
    sudoku: CellModel[] = [];
    sudokuFull: number[] = [];
    history: Action[] = [];

    saveExists: boolean = false;
    customCss: string;

    constructor(
        private sudokuGen2: SudokuGen2, 
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
    setEventSubscribers()
    {
        if (this.myKeypressCallback) return;

        this.myKeypressCallback = e =>
        {
            this.keyInput.handleKey(e, this.sudoku, this.position, this.inputMove, this.isEdit);
            this.doValidation();
        };
        document.addEventListener('keydown', this.myKeypressCallback, { capture: true });
    }

    removeEventSubscribers()
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

        let grid: number[][] =
            [ 
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ],
            [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
            ];

        let ns = new SudokuGen2();

        //Mutates passed in grid, returns puzzle to solve
        let toSolve: number[][] = ns.processSudoku(grid, this.selectedDiff);

        //flatten arrays
        this.sudokuFull = [].concat(...grid);
        let toSolve1D: number[] = [].concat(...toSolve);

        //clear cells for fresh start
        this.clearSudoku();

        //update cell models
        toSolve1D.forEach((v, i) =>
        {
            if(v !== 0)
                this.sudoku[ i ].startValue = '' + v;
        });
    }

    clearSudoku()
    {
        // init values
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

    resetSudokuErrors()
    {
        for (let i = 0; i <= sudokuLoopSize; i++)
        {
            this.sudoku[ i ].isError = false;
        }
    }

    doEdit()
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

        //map cell objects to array for comparison with stored solution
        let checkSolved: number[] = this.sudoku.map((e) =>
        {
            let v = e.value;
            let s = e.startValue;
            return e.value !== "" ? +e.value : +e.startValue;
        });

        if (this.sudokuGen2.isSolvedSudoku(checkSolved))
        {
            alerty.alert(
                "<h1>Congratulations!</h1>", 
                { title: 'Success', okLabel: 'Ok' });
        }
    }

    allowNewOverwrite()
    {
        if (this.isDirty)
        {
            alerty.confirm(
                "This will overwrite any changes. Are you sure?", 
                { okLabel: 'Ok', cancelLabel: 'Cancel' }, 
                () => this.newOk(), 
                () => this.cancelled("Generate"));
            return;
        }

        this.newOk();
    }

    newOk()
    {
        this.generateSudoku();
    }

    allowLoadOverwrite()
    {
        if (this.isDirty)
        {
            alerty.confirm(
                "This will overwrite any changes. Are you sure?", 
                { okLabel: 'Ok', cancelLabel: 'Cancel' }, 
                () => this.loadOk(), 
                () => this.cancelled("Load"));
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

    cancelled(message: string)
    {
        alerty.toast(`${message} Cancelled`);
    }

    allowSaveOverwrite()
    {
        if (this.loadSaveUtils.doesSaveExist())
        {
            alerty.confirm(
                "This will overwrite your current save data, are you sure?", 
                { okLabel: 'Ok', cancelLabel: 'Cancel' }, 
                () => this.saveOk(), 
                () => this.cancelled("Save"));

            return;
        }

        this.loadSaveUtils.saveData(this.sudoku, this.sudokuFull);
    }

    saveOk()
    {
        this.loadSaveUtils.saveData(this.sudoku, this.sudokuFull);
    }
}
