import Component, { ComponentArg } from "~/core/component";
import { DeepRequied } from "~/type";
import { reactive } from "~/utils";

type ImgArg = {
  image: HTMLImageElement | string;
  clip?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
};
/**
 *
 *
 * @export
 * @class Img
 * @extends {Component}
 * 加载图片组件，用于显示图片
 */
export default class Img extends Component {
  image: HTMLImageElement;

  clip: DeepRequied<ImgArg>["clip"];

  constructor({ ...arg }: ComponentArg & ImgArg) {
    if (!arg.transform) {
      arg.transform = {};
    }
    let img = arg.image;
    if (typeof arg.image === "string") {
      img = new Image();
      img.src = arg.image;
    }
    arg.image = img as HTMLImageElement;
    const hasSizeInArg = !!arg.transform.size;

    super(arg);
    this.image = arg.image;
    this.clip = arg.clip
      ? reactive(arg.clip, () => {
          this.update();
        })
      : reactive(
          {
            x: 0,
            y: 0,
            w: this.image.width || -1,
            h: this.image.height || -1,
          },
          () => {
            this.update();
          },
        );
    if (!this.image.complete) {
      this.image.onload = () => {
        if (!hasSizeInArg) {
          this.transform.size.width = this.image.width;
          this.transform.size.height = this.image.height;
        }
        if (this.clip.w === -1 || this.clip.h === -1) {
          this.clip.w = this.image.width;
          this.clip.h = this.image.height;
        }
        this.update();
      };
    }
  }

  /** @internal */
  render(ctx: CanvasRenderingContext2D) {
    if (!this.image.complete) return;
    ctx.drawImage(
      this.image,
      this.clip.x,
      this.clip.y,
      this.clip.w,
      this.clip.h,
      0,
      0,
      this.transform.size.width,
      this.transform.size.height,
    );
  }
}
