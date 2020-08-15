import { saveVersion } from './environment';
import * as alerty from "alerty/dist/js/alerty.js";
import { CellModel } from './cell-model';

export class LoadSaveUtils
{
    private readonly lsSaveName = "AU2.Sudoku.save";

    doesSaveExist(): boolean
    {
        let json = localStorage.getItem(this.lsSaveName);

        if (json === null) return false;

        let save = JSON.parse(json);
        if (!save || save.version !== saveVersion) return false;

        return true;
    }

    saveData(sudoku: CellModel[], sudokuFull: number[]): void
    {
        let json: string = JSON.stringify({ version: saveVersion, data: sudoku, full: sudokuFull });

        localStorage.setItem(this.lsSaveName, json);
        alerty.toasts("Saved");
    }

    versionMismatchOk()
    {
        localStorage.setItem(this.lsSaveName, null);
    }

    loadSaveData(sudoku: CellModel[], sudokuFull: number[]): void
    {
        let json = localStorage.getItem(this.lsSaveName);

        if (json === null) return;

        let save = JSON.parse(json);
        if (!save || save.version !== saveVersion) 
        {
            alerty.alert("Version mismatch, unable to load the previous save.", { okLabel: 'Ok' }, () => this.versionMismatchOk());
            return;
        }

        let a = save.full;
        a.forEach((data, idx) => sudokuFull.splice(idx, 1, data));
        //sudokuFull = save.full;
        let matrix: CellModel[] = save.data;

        matrix.forEach((e: CellModel, idx: number) =>
        {
            Object.setPrototypeOf(e, CellModel.prototype);
            sudoku.splice(idx, 1, e);
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