import { CellModel } from "./cell-model";
import { Position } from './position';
import { blockSize, sudokuLoopSize, sudokuSize } from "./constants";
import { SudokuUtils } from "./sudoku-utils";

export class MoveCellSelection
{
    moveCellSelection(sudoku: CellModel[], key:string, position: Position): void
    {
        position.prevPos = position.currPos;

        switch (key)
        {
            case "ArrowUp":
                this.moveUp(sudoku, position);
                break;
            case "ArrowDown":
                this.moveDown(sudoku, position);
                break;
            case "ArrowLeft":
                this.moveLeft(sudoku, position);
                break;
            case "ArrowRight":
                this.moveRight(sudoku, position);
                break;
            default:
                return;
        }
    }

    moveDown(sudoku: CellModel[], position: Position)
    {
        let pos = position.currPos;
        pos = pos + blockSize;
        if (pos > sudokuLoopSize)
        {
            pos = pos - sudokuSize;
        }
        position.currPos = pos;
        this.markSelectedCell(sudoku, position);
    }

    moveUp(sudoku: CellModel[], position)
    {
        let pos = position.currPos;
        pos = pos - blockSize;
        if (pos < 0)
        {
            pos = sudokuSize + pos;
        }
        position.currPos = pos;
        this.markSelectedCell(sudoku, position);
    }

    moveRight(sudoku: CellModel[], position: Position)
    {
        let pos = position.currPos;
        let row = SudokuUtils.returnRow(pos);
        let rowCol = pos % blockSize;
        rowCol = (rowCol + 1) % blockSize;
        position.currPos = row * blockSize + rowCol;
        this.markSelectedCell(sudoku, position);
    }

    moveLeft(sudoku: CellModel[], position: Position)
    {
        let pos = position.currPos;
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
        position.currPos = row * blockSize + rowCol;
        this.markSelectedCell(sudoku, position);
    }

    markSelectedCell(sudoku: CellModel[], position: Position): void
    {
        let model = sudoku[ position.prevPos ];
        model.isSelected = false;
        sudoku.splice(position.prevPos, 1, model);

        model = sudoku[ position.currPos ];
        model.isSelected = true;
        sudoku.splice(position.currPos, 1, model);
    }
}