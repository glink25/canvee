import { CanveeExtension } from "./extension";
import { Point, Size, Position, DeepRequied } from "../type";
import {
  mergeConfig,
  reactive,
  slowDeepClone,
  travelComponent,
} from "../utils";
import Dispatcher from "./dispatcher";
import Canvee from "./core";

type OriginType = Point;
type AnchorType = Point;
type ScaleType = Point;
type SkewType = Point;

type EmitOption = { bubble?: boolean };

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
  name: "",
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

export default class Component extends Dispatcher {
  transform: DeepRequied<ComponentArg>["transform"];

  children: Array<Component>;

  /** @internal */
  usages: Array<CanveeExtension>;

  name: string;

  parent?: Component;

  // eslint-disable-next-line no-use-before-define
  scene?: Scene;

  /** @internal */
  notifyReRender?: () => void;

  /** @internal */
  notifyTreeReBuild?: () => void;

  constructor({ transform, name = defaultComponentArg.name }: ComponentArg) {
    super();
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

  /** @internal */
  protected treeRebuild() {
    this.notifyTreeReBuild?.();
  }

  private addComponent(c: Component) {
    c.parent = this;
    c.scene = this.scene;
    travelComponent(c, (comp) => {
      comp.notifyReRender = this.notifyReRender;
      comp.notifyTreeReBuild = this.notifyTreeReBuild;
      comp.scene = this.scene;
    });

    this.children.push(c);
    this.children = this.children.sort(
      (a, b) => a.transform.zIndex - b.transform.zIndex,
    );
  }

  addChildren<T extends Component>(...components: Array<T>) {
    components.forEach((c) => {
      this.addComponent(c);
    });
    this.treeRebuild();
  }

  addChild<T extends Component>(c: T): T {
    this.addComponent(c);
    this.treeRebuild();
    return c;
  }

  removeChild(c: Component) {
    const index = this.children.findIndex((e) => e === c);
    if (index !== -1) {
      const target = this.children[index];
      target.scene = undefined;
      target.parent = undefined;
      this.children.splice(index, 1);
      this.treeRebuild();
    }
  }

  /**
   *
   * @returns 每个组件同类型的Usage只能有一个，多次添加仅返回第一个
   */
  use<T extends CanveeExtension>(u: T): T {
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

  discard<T extends CanveeExtension>(extension: T) {
    extension.beforeDiscard(this);
    this.usages = this.usages.filter(
      (u) => u.constructor !== extension.constructor,
    );
  }

  forceUpdate() {
    this.update();
  }

  destroy() {
    this.parent?.removeChild(this);
    // shoud delete
  }

  /** @internal */
  recieve(comp: Component, name: string, value?: unknown, option?: EmitOption) {
    const stopped = this.eventMap[name]?.some((fn) =>
      fn({
        target: comp,
        value,
      }),
    );
    if (option?.bubble && !stopped) {
      this.parent?.recieve(comp, name, value, option);
    }
  }

  /**
   *
   *
   * @param {EmitOption} [option] option.bubble set as true means to make the event
   * continual passed to the parent component until Scene
   */
  emit(name: string, value?: unknown, option?: EmitOption) {
    this.recieve(this, name, value, option);
  }
}

export class Scene extends Component {
  isRoot: boolean;

  canvee: Canvee;

  constructor(arg: ComponentArg & { canvee: Canvee }) {
    super(arg);
    this.isRoot = true;
    this.canvee = arg.canvee;
  }
}

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
