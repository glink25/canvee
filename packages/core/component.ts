import { CanveeExtension } from "./system";
import { Point, Size, Position, DeepRequied } from "../type";
import {
  mergeConfig,
  reactive,
  slowDeepClone,
  travelComponent,
} from "../utils";

type OriginType = Point;
type AnchorType = Point;
type ScaleType = Point;
type SkewType = Point;

export type ComponentArg = {
  name?: string;
  transform?: {
    size?: Size;
    position?: Position;
    scale?: ScaleType;
    zIndex?: number;
    origin?: OriginType;
    anchor?: AnchorType;
    rotate?: number;
    alpha?: number;
    skew?: SkewType;
  };
};
const defaultComponentArg = {
  name: "untitled",
  transform: {
    size: { width: 0, height: 0 },
    position: { x: 0, y: 0 },
    scale: {
      x: 1,
      y: 1,
    },
    zIndex: 0,
    origin: {
      x: 0.5,
      y: 0.5,
    },
    anchor: {
      x: 0,
      y: 0,
    },
    skew: {
      x: 0,
      y: 0,
    },
    rotate: 0,
    alpha: 1,
  },
};

class Component {
  transform: DeepRequied<ComponentArg>["transform"];

  children: Array<Component>;

  /** @internal */
  usages: Array<CanveeExtension>;

  name: string;

  parent?: Component;

  /** @internal */
  notifyReRender?: () => void;

  /** @internal */
  notifyTreeReBuild?: () => void;

  constructor({ transform, name = defaultComponentArg.name }: ComponentArg) {
    this.name = name;
    const selfTransform = mergeConfig(defaultComponentArg.transform, transform);
    this.transform = slowDeepClone(selfTransform);
    this.children = [];
    this.usages = [];

    this.transform = reactive(this.transform, () => {
      this.update();
    });
  }

  /** @internal */
  setContext(ctx: CanvasRenderingContext2D) {
    if (!this.parent) return;
    const { scale, size, origin, anchor, rotate, position, alpha, skew } =
      this.transform;
    const psize = this.parent.transform.size;
    const x = size.width * origin.x;
    const y = size.height * origin.y;
    const ox = psize.width * anchor.x - x + position.x;
    const oy = psize.height * anchor.y - y + position.y;

    ctx.translate(x, y);
    ctx.translate(ox, oy);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(scale.x, scale.y);
    ctx.transform(1, skew.x, skew.y, 1, 0, 0);

    ctx.translate(-x, -y);
    ctx.globalAlpha = alpha;
  }

  /** @internal */
  render(_ctx: CanvasRenderingContext2D) {}

  /** @internal */
  protected update() {
    this.notifyReRender?.();
  }

  protected treeRebuild() {
    this.notifyTreeReBuild?.();
  }

  addChild<T extends Component>(c: T): T {
    travelComponent(c, (comp) => {
      comp.notifyReRender = this.notifyReRender;
      comp.notifyTreeReBuild = this.notifyTreeReBuild;
    });

    c.parent = this;
    this.children.push(c);
    this.children = this.children.sort(
      (a, b) => a.transform.zIndex - b.transform.zIndex,
    );
    this.treeRebuild();
    return c;
  }

  removeChild(c: Component) {
    const index = this.children.findIndex((e) => e === c);
    if (index !== -1) {
      delete this.children[index];
      this.children.splice(index, 1);
      this.treeRebuild();
    }
  }

  /**
   *
   * @returns 每个组件同类型的Usage只能有一个，多次添加仅返回第一个
   */
  use<T extends CanveeExtension>(u: T) {
    let res;
    const index = this.usages.findIndex(
      (ug) => u.constructor === ug.constructor,
    );
    if (index === -1) {
      this.usages.push(u);
      res = u;
    } else {
      res = this.usages[index] as T;
    }
    u.onAdded(this);
    return res;
  }

  forceUpdate() {
    this.update();
  }

  destroy() {
    this.parent?.removeChild(this);
    // shoud delete
  }
}

export default Component;

// type CalcTransformArg = {
//   leftTop: Point;
//   rightTop: Point;
//   rightBottom: Point;
//   leftBottom: Point;
// };
// class CalcTransform {
//   leftTop: Point;
//   rightTop: Point;
//   rightBottom: Point;
//   leftBottom: Point;
//   width: number;
//   height: number;
//   constructor({
//     leftTop,
//     rightTop,
//     rightBottom,
//     leftBottom,
//   }: CalcTransformArg) {
//     this.leftTop = leftTop;
//     this.rightBottom = rightBottom;
//     this.rightTop = rightTop;
//     this.leftBottom = leftBottom;
//     this.width = this.getWidth();
//     this.height = this.getHeight();
//   }
//   getWidth() {
//     return 100;
//   }
//   getHeight() {
//     return 100;
//   }
// }
