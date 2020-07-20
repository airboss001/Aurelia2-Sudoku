import { CellModel } from './cell-model';
import { bindable } from "aurelia";

export class Cell
{
    @bindable cellModel: CellModel;
}
