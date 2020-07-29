export class CellModel
{
    //active cell
    private _isSelected: boolean = false;
    private _isError: boolean = false;
    //preset cell value, if set disable cellValue
    private _startValue: string = "";
    private _value: string = "";
    private _rowHints: string = "";
    private _cellHints: string = "";
    private _showValue: string = "";

    set isSelected(value: boolean)
    {
        this._isSelected = value;
    }
    get isSelected(): boolean
    {
        return this._isSelected;
    }

    set isError(value: boolean)
    {
        this._isError = value;
    }
    get isError(): boolean
    {
        return this._isError;
    }

    set startValue(value: string)
    {
        this._startValue = value;
    }
    get startValue(): string
    {
        return this._startValue;
    }

    set showValue(value: string)
    {
        this._showValue = value;
    }
    get showValue(): string
    {
        return this._showValue;
    }

    set value(value: string)
    {
        //don't set if a start value
        if (this._startValue) return;

        this._value = value;
    }
    get value(): string
    {
        return this._value;
    }

    set rowHints(value: string)
    {
        this._rowHints = value;
    }
    get rowHints(): string
    {
        if (this._value) return "";
        return this._rowHints;
    }

    set cellHints(value: string)
    {
        this._cellHints = value;
    }
    get cellHints(): string
    {
        if (this._value) return "";

        return this._cellHints;
    }
}
