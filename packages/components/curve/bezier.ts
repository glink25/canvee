type Point = { x: number; y: number };

function getBezierCurvePoint(
  startPoint: Point,
  controllPointA: Point,
  controllPointB: Point,
  endPoint: Point,
  t: number,
) {
  return {
    x:
      (1 - t) ** 3 * startPoint.x +
      3 * t * (1 - t) ** 2 * controllPointA.x +
      3 * t * t * (1 - t) * controllPointB.x +
      t * t * t * endPoint.x,
    y:
      (1 - t) ** 3 * startPoint.y +
      3 * t * (1 - t) ** 2 * controllPointA.y +
      3 * t * t * (1 - t) * controllPointB.y +
      t * t * t * endPoint.y,
  };
}

function getRelativeBezierCurveLength(
  startPoint: Point,
  controllPointA: Point,
  controllPointB: Point,
  endPoint: Point,
) {
  const precis = 1000;
  const dis =
    new Array(10)
      .fill(0)
      .map((_, i) => {
        const [p1, p2] = [i / 10, i / 10 + 1 / precis].map((t) =>
          getBezierCurvePoint(
            startPoint,
            controllPointA,
            controllPointB,
            endPoint,
            t,
          ),
        );
        const distance = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
        return distance;
      })
      .reduce((a, b) => a + b) / 10;

  return dis * precis;
  // return quadraticBezierLength(startPoint, controllPointA, endPoint);
}

export default function generateBezierControllPoints(
  generatePoints: Array<Point>,
) {
  let lastEndPoint: { x: number; y: number };
  const newPoints = [
    generatePoints[0],
    ...generatePoints,
    generatePoints[generatePoints.length - 1],
  ];
  const scale = 6;
  const lengths = [0]; // 存储每条线的长度，用于计算百分比的位置
  // const rawLengths = [] as number[];
  const bezierPoints = [] as {
    beginPoint: Point;
    controllPointA: Point;
    controllPointB: Point;
    endPoint: Point;
  }[];
  newPoints.forEach((_p, i) => {
    if (i >= 1 && i <= newPoints.length - 3) {
      const [lastPoint, curentPoint, nextPoint, endPoint] = newPoints.slice(
        i - 1,
        i + 3,
      );
      const controllPointA = {
        x: curentPoint.x + (nextPoint.x - lastPoint.x) / scale,
        y: curentPoint.y + (nextPoint.y - lastPoint.y) / scale,
      };
      const controllPointB = {
        x: nextPoint.x - (endPoint.x - curentPoint.x) / scale,
        y: nextPoint.y - (endPoint.y - curentPoint.y) / scale,
      };
      if (!lastEndPoint) lastEndPoint = lastPoint;
      bezierPoints.push({
        beginPoint: lastEndPoint,
        controllPointA,
        controllPointB,
        endPoint: nextPoint,
      });
      const length = getRelativeBezierCurveLength(
        lastEndPoint,
        controllPointA,
        controllPointB,
        nextPoint,
      );
      lengths.push(length + lengths[lengths.length - 1]);
      // rawLengths.push(length);
      lastEndPoint = nextPoint;
    }
  });
  const getPoint = (p: number) => {
    if (p < 0 || p > 1) throw new Error("p is between 0 and 1");
    const curLength = lengths[lengths.length - 1] * p;
    const index = p === 0 ? 0 : lengths.findIndex((l) => l >= curLength) - 1;
    const t =
      (curLength - lengths[index]) / (lengths[index + 1] - lengths[index]);
    const { beginPoint, controllPointA, controllPointB, endPoint } =
      bezierPoints[index];
    return {
      ...getBezierCurvePoint(
        beginPoint,
        controllPointA,
        controllPointB,
        endPoint,
        t,
      ),
      index,
    };
  };
  const getProgressConfig = (progress: number) => {
    const { index } = getPoint(progress);
    // const leftDis = lengths[lengths.length - 1] - lengths[index];
    // const leading = leftDis / (lengths[index + 1] - lengths[index]);
    const leading = lengths[index] / lengths[lengths.length - 1];
    return { index, leading, trail: progress };
  };
  return { bezierPoints, getPoint, getProgressConfig };
}

// 2阶贝塞尔曲线长度计算函数
// function quadraticBezierLength(
//   startPoint: Point,
//   controllPoint: Point,
//   endPoint: Point
// ) {
//   const { x: x1, y: y1 } = startPoint;
//   const { x: x2, y: y2 } = controllPoint;
//   const { x: x3, y: y3 } = endPoint;
//   let a, b, e, c, d, u, a1, e1, c1, d1, u1, v1x, v1y;

//   v1x = x2 * 2;
//   v1y = y2 * 2;
//   d = x1 - v1x + x3;
//   d1 = y1 - v1y + y3;
//   e = v1x - 2 * x1;
//   e1 = v1y - 2 * y1;
//   c1 = a = 4 * (d * d + d1 * d1);
//   c1 += b = 4 * (d * e + d1 * e1);
//   c1 += c = e * e + e1 * e1;
//   c1 = 2 * Math.sqrt(c1);
//   a1 = 2 * a * (u = Math.sqrt(a));
//   u1 = b / u;
//   a = 4 * c * a - b * b;
//   c = 2 * Math.sqrt(c);
//   return (
//     (a1 * c1 + u * b * (c1 - c) + a * Math.log((2 * u + u1 + c1) / (u1 + c))) /
//     (4 * a1)
//   );
// }
