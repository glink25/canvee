import generateBezierControllPoints from "./bezier";
import { Point } from "~/type";
import Graphic from "~/components/graphic";

type SnakeMapArg = {
  points: Array<Point>;
};
export default function createBezierCurve({ points }: SnakeMapArg) {
  const { bezierPoints } = generateBezierControllPoints(points);
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "red";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.beginPath();
    bezierPoints.forEach(
      ({ beginPoint, controllPointA, controllPointB, endPoint }) => {
        ctx.moveTo(beginPoint.x, beginPoint.y);
        ctx.bezierCurveTo(
          controllPointA.x,
          controllPointA.y,
          controllPointB.x,
          controllPointB.y,
          endPoint.x,
          endPoint.y,
        );
      },
    );

    ctx.stroke();
  };
  let maxX = -Infinity;
  let maxY = -Infinity;
  let minX = Infinity;
  let minY = Infinity;
  bezierPoints.forEach(({ beginPoint, endPoint }) => {
    maxX = Math.max(maxX, beginPoint.x, endPoint.x);
    maxY = Math.max(maxY, beginPoint.y, endPoint.y);
    minX = Math.min(minX, beginPoint.x, endPoint.x);
    minY = Math.min(minY, beginPoint.y, endPoint.y);
  });
  const size = {
    width: maxX - minX,
    height: maxY - minY,
  };
  const snakeMap = new Graphic({
    transform: {
      size,
      scale: {
        x: 0.5,
        y: 0.5,
      },
      origin: { x: 0.5, y: 0.5 },
      anchor: { x: 0.5, y: 0.5 },
    },
    draw,
  });
  return snakeMap;
}
