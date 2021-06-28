import Component from "~/core/component";
import { CanveeExtension } from "~/core/system";

/**
 *
 *
 * @export
 * @class Mask
 * @implements {CanveeExtension}
 * @description Mask组件会以添加其的组件的绘制线为边界作为遮罩
 */
export default class Mask implements CanveeExtension {
  onAdded(c: Component) {
    const oldRender = c.render;
    c.render = (ctx: CanvasRenderingContext2D) => {
      oldRender.call(c, ctx);
      ctx.clip();
    };
  }
}
