import Graphic from "~/components/graphic";
import { Size } from "~/type";

type RectArg = {
  grid?: [number, number];
  size: Size;
};
export default function createGrid({ grid = [1, 1], size }: RectArg) {
  const rect = new Graphic({
    transform: {
      size,
      origin: { x: 0, y: 0 },
    },
    draw: (ctx) => {
      ctx.strokeStyle = "black";
      ctx.beginPath();

      // boundary
      ctx.moveTo(0, 0);
      ctx.lineTo(0, size.height);
      ctx.lineTo(size.width, size.height);
      ctx.lineTo(size.width, 0);
      ctx.lineTo(0, 0);

      // column
      const column = grid[0];
      const columnSplit = grid[1] + 1;
      for (let i = 1; i <= column; i++) {
        ctx.moveTo(0, (size.height / columnSplit) * i);
        ctx.lineTo(size.width, (size.height / columnSplit) * i);
      }

      // row
      const row = grid[1];
      const rowSplit = grid[1] + 1;
      for (let i = 1; i <= row; i++) {
        ctx.moveTo((size.width / rowSplit) * i, 0);
        ctx.lineTo((size.width / rowSplit) * i, size.height);
      }
      ctx.stroke();
    },
  });
  return rect;
}
