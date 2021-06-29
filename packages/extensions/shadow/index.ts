import Component from "~/core/component";
import { CanveeExtension } from "~/core/system";
import { reactive } from "~/utils";

type ShadowArg = {
  color: string;
  offset?: {
    x: number;
    y: number;
  };
  blur: number;
};
const DefaultShadowArg = {
  color: "black",
  blur: 0.6,
  offset: {
    x: 5,
    y: 5,
  },
};

/**
 *
 *
 * @export
 * @class Shadow
 * @implements {CanveeExtension}
 * @description Shadow组件会为组件添加阴影
 */
export default class Shadow implements CanveeExtension {
  #color: ShadowArg["color"];

  offset: Required<ShadowArg>["offset"];

  #blur: ShadowArg["blur"];

  #component?: Component;

  constructor(arg: ShadowArg) {
    this.#color = arg?.color ?? DefaultShadowArg.color;
    const offset = arg?.offset ?? { ...DefaultShadowArg.offset };
    this.offset = reactive(offset, () => {
      this.update();
    });
    this.#blur = arg?.blur ?? DefaultShadowArg.blur;
  }

  private update() {
    this.#component?.forceUpdate();
  }

  onAdded(c: Component) {
    const oldRender = c.render;
    c.render = (ctx: CanvasRenderingContext2D) => {
      ctx.shadowBlur = this.#blur;
      ctx.shadowColor = this.#color;
      ctx.shadowOffsetX = this.offset.x;
      ctx.shadowOffsetY = this.offset.y;
      oldRender.call(c, ctx);
    };
  }

  set color(s: string) {
    if (s !== this.#color) {
      this.#color = s;
      this.update();
    }
  }

  get color() {
    return this.#color;
  }

  set blur(s: number) {
    if (s !== this.#blur) {
      this.#blur = s;
      this.update();
    }
  }

  get blur() {
    return this.#blur;
  }
}
