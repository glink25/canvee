import Component, { ComponentArg } from "~/core/component";
import { Color } from "~/type";

function drawRoundRectPathBy(cxt: CanvasRenderingContext2D, isRound: boolean) {
  return isRound
    ? function drawRoundRect(
        _x: number,
        _y: number,
        w: number,
        h: number,
        r: number,
      ) {
        cxt.beginPath();
        cxt.moveTo(w - r, h - r);
        // 从右下角顺时针绘制，弧度从0到1/2PI
        cxt.arc(w - r, h - r, r, 0, Math.PI / 2);

        // 矩形下边线
        cxt.lineTo(r, h);

        // 左下角圆弧，弧度从1/2PI到PI
        cxt.arc(r, h - r, r, Math.PI / 2, Math.PI);

        // 矩形左边线
        cxt.lineTo(0, r);

        // 左上角圆弧，弧度从PI到3/2PI
        cxt.arc(r, r, r, Math.PI, (Math.PI * 3) / 2);

        // 上边线
        cxt.lineTo(w - r, 0);

        // 右上角圆弧
        cxt.arc(w - r, r, r, (Math.PI * 3) / 2, Math.PI * 2);

        // 右边线
        cxt.lineTo(w, h - r);
        cxt.closePath();
      }
    : function drawRect(
        x: number,
        y: number,
        w: number,
        h: number,
        _r: number,
      ) {
        cxt.beginPath();
        cxt.rect(x, y, w, h);
        cxt.closePath();
      };
}

type RectArg = {
  transform: ComponentArg["transform"];
  name?: string;
  borderWidth?: number;
  borderColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
};

export default class Rect extends Component {
  #borderWidth: number;

  #borderColor: Color;

  #backgroundColor: Color;

  #borderRadius: number;

  constructor({
    transform,
    borderWidth,
    borderColor,
    borderRadius,
    backgroundColor,
    name = "rect",
  }: RectArg) {
    super({ transform, name });
    this.#backgroundColor = backgroundColor ?? "transparent";
    this.#borderColor = borderColor ?? "transparent";
    this.#borderRadius = borderRadius ?? 0;
    this.#borderWidth = borderWidth ?? 0;
  }

  set borderWidth(v: number) {
    if (v === this.#borderWidth) return;
    this.#borderWidth = v;
    this.update();
  }

  get borderWidth() {
    return this.#borderWidth;
  }

  set borderRadius(v: number) {
    if (v === this.#borderRadius) return;
    this.#borderRadius = v;
    this.update();
  }

  get borderRadius() {
    return this.#borderRadius;
  }

  set borderColor(v: Color) {
    if (v === this.#borderColor) return;
    this.#borderColor = v;
    this.update();
  }

  get borderColor() {
    return this.#borderColor;
  }

  set backgroundColor(v: Color) {
    if (v === this.#backgroundColor) return;
    this.#backgroundColor = v;
    this.update();
  }

  get backgroundColor() {
    return this.#backgroundColor;
  }

  render(ctx: CanvasRenderingContext2D) {
    const drawRect = drawRoundRectPathBy(ctx, this.borderRadius !== 0);
    ctx.lineWidth = this.borderWidth;

    drawRect(
      0,
      0,
      this.transform.size.width,
      this.transform.size.height,
      this.borderRadius,
    );
    if (this.borderColor !== "transparent") {
      ctx.strokeStyle = this.borderColor;
      ctx.stroke();
    }
    if (this.backgroundColor !== "transparent") {
      ctx.fillStyle = this.backgroundColor;
      ctx.fill();
    }
    // ctx.clip();
  }
}
