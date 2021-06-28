import Component, { ComponentArg } from "~/core/component";

type GraphicArg = {
  draw: (ctx: CanvasRenderingContext2D) => void;
};
/**
 * @export
 * @class Graphic
 * @extends {Component}
 * 绘制画图组件，可以直接调用canvas context
 */
export default class Graphic extends Component {
  /** @internal */
  draw: GraphicArg["draw"];

  constructor({ ...arg }: ComponentArg & GraphicArg) {
    super(arg);
    this.draw = arg.draw;
  }

  /** @internal */
  render(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);
  }
}
