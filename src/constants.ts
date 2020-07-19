//1 base
//block size is the numbber of cells for a row, column, or 3x3 block
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

