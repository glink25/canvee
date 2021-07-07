import { CanveeExtension } from "~/core/extension";

/**
 *
 *
 * @export
 * @class Mask
 * @implements {CanveeExtension}
 * @description Mask组件会以添加其的组件的绘制线为边界作为遮罩
 */
export default class Mask implements CanveeExtension {
  onAdded() {}

  beforeDiscard() {}

  afterRender(_c, ctx: CanvasRenderingContext2D) {
    ctx.clip();
  }

  beforeRender() {}
}
