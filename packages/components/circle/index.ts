import Component, { ComponentArg } from "~/core/component";
import { Color } from "~/type";
import { reactive } from "~/utils";

type CircleArg = {
  radius: number;
  style: {
    borderColor?: Color;
    backgroundColor: Color;
    borderWidth?: number;
  };
};
export default class Circle extends Component {
  #radius: number;

  style: CircleArg["style"];

  constructor(arg: ComponentArg & CircleArg) {
    super(arg);
    this.#radius = arg.radius;
    this.style = reactive(arg.style, () => {
      this.update();
    });
    this.transform.size.width = this.#radius * 2;
    this.transform.size.height = this.#radius * 2;
  }

  /** @internal */
  render(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.radius, this.radius, this.radius, 0, Math.PI * 2, false);
    if (this.style.backgroundColor !== "transparent") {
      ctx.fillStyle = this.style.backgroundColor;
      ctx.fill();
    }
    if (this.style.borderWidth) {
      ctx.strokeStyle = this.style.borderColor ?? "black";
      ctx.lineWidth = this.style.borderWidth;
      ctx.stroke();
    }
  }

  set radius(r: number) {
    if (r === this.#radius) return;
    this.#radius = r;
    this.transform.size.width = this.#radius * 2;
    this.transform.size.height = this.#radius * 2;
  }

  get radius() {
    return this.#radius;
  }
}
