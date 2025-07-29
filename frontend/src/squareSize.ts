interface args { x: number, y: number, n: number }


export default function ({ x, y, n }: args) {
  // Compute number of rows and columns, and cell size,
  // given height (y), width (x) and number of items (n).
  // https://math.stackexchange.com/a/2570649
  const ratio = x / y;
  // console.log("ratio", ratio)
  const nColsFloat = Math.sqrt(n * ratio);
  // console.log("nColsFloat", nColsFloat)
  const nRowsFloat = n / nColsFloat;
  // console.log("nRowsFloat", nRowsFloat)

  // Find best option filling the whole height
  let nRows1 = Math.ceil(nRowsFloat);
  let nCols1 = Math.ceil(n / nRows1);
  while (nRows1 * ratio < nCols1) {
    nRows1++;
    nCols1 = Math.ceil(n / nRows1);
  }
  const nExtra1 = (nRows1 * nCols1) - n
  const cellSize1 = Math.floor(y / nRows1);

  // Find best option filling the whole width
  let nCols2 = Math.ceil(nColsFloat);
  let nRows2 = Math.ceil(n / nCols2);
  while (nCols2 < nRows2 * ratio) {
    nCols2++;
    nRows2 = Math.ceil(n / nCols2);
  }
  const nExtra2 = (nRows2 * nCols2) - n
  const cellSize2 = Math.floor(x / nCols2);

  // Find the best values
  const res1 = {
    nRows: nRows1,
    nCols: nCols1,
    cellSize: cellSize1,
    nExtra: nExtra1
  };
  const res2 = {
    nRows: nRows2,
    nCols: nCols2,
    cellSize: cellSize2,
    nExtra: nExtra2
  };
  // console.log(res1);
  // console.log(res2);
  let res;
  if ((cellSize2 * nCols2 > x) || (cellSize2 * nRows2 > y)) {
    res = res1;
  } else if ((cellSize1 * nCols1 > x) || (cellSize1 * nRows1 > y)) {
    res = res2;
  } else {
    res = cellSize1 > cellSize2 ? res1 : res2;
  }
  // console.log(res);
  return res;
}
