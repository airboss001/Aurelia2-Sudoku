export class CellPositionValueConverter
{
    toView(value)
    {
        return (Math.floor(value/9) + 1 + "") + ((value % 9) + 1 + "");
    }
}