export class Hints
{
    constructor(rowHint: boolean, cellHint: boolean)
    {
        this.isRowHint = rowHint;
        this.isCellHint = cellHint;
    }

    isRowHint: boolean = false;
    isCellHint: boolean = false;
}