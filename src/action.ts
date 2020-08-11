export class Action
{
    position: number;
    newValue: number;
    oldValue: number;

    constructor(position: number, oldValue: number, newValue: number)
    {
        this.position = position;
        this.oldValue  = oldValue;
        this.newValue = newValue;
    }
}