import { version } from './environment';
import 'alerty/dist/js/alerty.js'; //https://github.com/undead25/alerty
import 'alerty/dist/css/alerty.css';

export class MyApp
{
    constructor()
    {
        document.title = `Aurelia2-Sudoku ${version}`;
    }
}
