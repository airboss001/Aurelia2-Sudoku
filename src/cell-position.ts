import { blockSize } from "./constants";

export class CellPositionValueConverter
{
    toView(value)
    {
        return (Math.floor(value / blockSize) + 1 + "") + ((value % blockSize) + 1 + "");
    }
}