//block size is the number of cells for a row, column, or 3x3 block
export const blockSize: number = 9;
export const sudokuSize: number = blockSize*blockSize;

export const cellRowSize: number = 3;
export const cellColSize: number = 3;
export const cellsInBlock: number = 27;

// zero base
export const sudokuLoopSize: number = sudokuSize -1;
export const blockLoopMax: number = blockSize - 1;
export const blockRowMax: number = blockLoopMax;
export const blockColMax: number = blockLoopMax;

export enum boardSize
{
    large = 1,
    medium = .8,
    small = .6
}

//initial board size width and height, if changed also update in sudou.scss
export const initialHeight: number = 604;
export const initialWidth: number = 604;

export const positionTopLeft: number = 0;