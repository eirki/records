export default function ({ x, y, n }) {
    // https://math.stackexchange.com/a/2570649
    // Compute number of rows and columns, and cell size
    const ratio = x / y
    const nColsFloat = Math.sqrt(n * ratio)
    const nRowsFloat = n / nColsFloat

    // Find best option filling the whole height
    let nRows1 = Math.ceil(nRowsFloat)
    let nCols1 = Math.ceil(n / nRows1)
    while (nRows1 * ratio < nCols1) {
        nRows1++
        nCols1 = Math.ceil(n / nRows1)
    }
    const cellSize1 = y / nRows1

    // Find best option filling the whole width
    let nCols2 = Math.ceil(nColsFloat)
    let nRows2 = Math.ceil(n / nCols2)
    while (nCols2 < nRows2 * ratio) {
        nCols2++
        nRows2 = Math.ceil(n / nCols2)
    }
    const cellSize2 = x / nCols2 // Find the best values

    console.log(cellSize1 < cellSize2)
    const res1 = {
        nRows: nRows1,
        nCols: nCols1,
        cellSize: cellSize1
    }
    const res2 = {
        nRows: nRows2,
        nCols: nCols2,
        cellSize: cellSize2
    }
    console.log(res1)
    console.log(res2)
    let res
    if ((cellSize2 * nCols2 > x) | (cellSize2 * nRows2 > y)) {
        res = res1
    } else if ((cellSize1 * nCols1 > x) | (cellSize1 * nRows1 > x)) {
        res = res2
    } else {
        res = (cellSize1 > cellSize2) ? res1 : res2
    }
    return res
}
