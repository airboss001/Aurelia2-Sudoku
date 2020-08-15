export class Position
{
    constructor(prevPos: number, currPos: number)
    {
        this.prevPos = prevPos;
        this.currPos = currPos;
    }
    
    prevPos: number;
    currPos: number;
}