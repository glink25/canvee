import Component, { ComponentArg } from "./component";
import CanveeExtensionSystem, {
  CanveeExtension,
  SystemHook,
  SystemHooks,
} from "./system";
import { Point, Size } from "../type";
import { travelComponent, watchResize } from "../utils";

type CanveeArg = {
  canvas: HTMLCanvasElement;
  size: Size;
  devicePixelRatio?: number;
  systems?: Array<CanveeExtensionSystem>;
};

class Scene extends Component {
  isRoot: boolean;

  constructor(arg: ComponentArg) {
    super(arg);
    this.isRoot = true;
  }
}

export default class Canvee {
  readonly canvas: HTMLCanvasElement;

  readonly scene: Scene;

  ratio: Point;

  readonly devicePixelRatio: number;

  #size: Size;

  #systems: Array<CanveeExtensionSystem>;

  #isDirty: boolean;

  #loopTimer?: number;

  #stopWatchResize?: () => void;

  readonly #sytemGroup!: {
    [p in SystemHook]: Array<CanveeExtensionSystem>;
  };

  constructor({ canvas, size, systems = [], devicePixelRatio = 1 }: CanveeArg) {
    this.#isDirty = true;
    this.devicePixelRatio = devicePixelRatio;
    if (canvas) this.canvas = canvas;
    else {
      const c = document.createElement("canvas");
      document.body.appendChild(c);
      this.canvas = c;
    }
    const syses: CanveeExtensionSystem[] = [];
    this.#systems = systems.filter((sys) => {
      // 相同类型的system只能存在一个
      if (syses.every((e) => e.constructor !== sys.constructor)) {
        syses.push(sys);
        return true;
      }
      return false;
    });
    this.#size = size;
    this.scene = new Scene({
      transform: {
        size,
      },
      name: "scene",
    });
    this.scene.notifyReRender = () => {
      this.markAsDirty();
    };
    this.scene.notifyTreeReBuild = () => {
      this.markAsDirty();
    };

    this.ratio = { x: 1, y: 1 };
    this.#sytemGroup = {} as {
      [p in SystemHook]: Array<CanveeExtensionSystem>;
    };
    SystemHooks.forEach((hookName) => {
      this.#sytemGroup[hookName] = this.#systems.filter((sys) =>
        sys.registedHooks.includes(hookName),
      );
    });

    this.init();
    this.start();
  }

  /** @internal */
  getRatio = () => ({
    x: this.canvas.width / this.canvas.clientWidth / this.devicePixelRatio,
    y: this.canvas.height / this.canvas.clientHeight / this.devicePixelRatio,
  });

  private init() {
    this.canvas.width = this.#size.width * this.devicePixelRatio;
    this.canvas.height = this.#size.height * this.devicePixelRatio;
    this.ratio = this.getRatio();
    this.#stopWatchResize = watchResize(this.canvas, () => {
      this.ratio = this.getRatio();
    });
  }

  private start() {
    // beforeStart
    this.#sytemGroup.beforeSystemStart.forEach((sys) => {
      sys.instance = this;
      sys.beforeSystemStart();
    });
    const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.scale(this.devicePixelRatio, this.devicePixelRatio);

    // end-beforeStart
    const loop = () => {
      if (this.#isDirty) {
        const stop = window.requestAnimationFrame(() => {
          // beforeSystemReRender
          this.#sytemGroup.beforeSystemReRender.forEach((sys) =>
            sys.beforeSystemReRender(),
          );
          // end-beforeSystemReRender
          this.rerender();

          window.cancelAnimationFrame(stop);
        });
        this.#isDirty = false;
      }
      window.requestAnimationFrame(loop);
    };
    // beforeSystemNextLoop
    this.#sytemGroup.beforeSystemNextLoop.forEach((sys) => {
      sys.beforeSystemNextLoop();
    });
    // beforeSystemNextLoop

    // nextick(() => {
    this.#loopTimer = window.requestAnimationFrame(loop);
    // });
  }

  private rerender() {
    const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.clearRect(
      0,
      0,
      this.scene.transform.size.width,
      this.scene.transform.size.height,
    );

    travelComponent(
      this.scene,
      (comp) => {
        ctx.save();
        comp.setContext(ctx);
        // beforeComponentRender
        this.#sytemGroup.beforeComponentRender.forEach((sys) =>
          sys.beforeComponentRender(comp),
        );
        // end-beforeComponentRender
        comp.render(ctx);
      },
      () => {
        ctx.restore();
      },
    );
  }

  stop() {
    // beforeSystemStop
    this.#sytemGroup.beforeSystemStop.forEach((sys) => sys.beforeSystemStop());
    // beforeSystemStop
    this.#stopWatchResize!();
    this.scene.destroy();
    window.cancelAnimationFrame(this.#loopTimer!);
  }

  private markAsDirty() {
    this.#isDirty = true;
  }

  /** @internal */
  getMasterSystem(ext: CanveeExtension) {
    return this.#systems.find((sys) => sys.isMatserOf(ext));
  }
}
