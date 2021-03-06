import { Scene } from "./component";
import CanveeExtensionSystem, { SystemHook, SystemHooks } from "./extension";
import { Point, Size } from "../type";
import { Node, travelComponent, watchResize } from "../utils";

import { getSubTreeArr } from "~/utils/subtree";

type CanveeArg = {
  canvas: HTMLCanvasElement;
  size: Size;
  devicePixelRatio?: number;
  systems?: Array<CanveeExtensionSystem>;
};

export default class Canvee {
  readonly canvas: HTMLCanvasElement;

  readonly scene: Scene;

  ratio: Point;

  readonly devicePixelRatio: number;

  #size: Size;

  #resizeFn = (_s: Size) => {};

  systems: Array<CanveeExtensionSystem>;

  #isDirty: boolean;

  #loopTimer?: number;

  #stopWatchResize?: () => void;

  readonly #sytemGroup!: {
    [p in SystemHook]: Array<CanveeExtensionSystem>;
  };

  readonly #willUseSubtreeSystems: Array<CanveeExtensionSystem>;

  #subtreeArr: Array<Node | 0> = [];

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
    this.systems = systems.filter((sys) => {
      // 相同类型的system只能存在一个
      if (syses.every((e) => e.constructor !== sys.constructor)) {
        syses.push(sys);
        return true;
      }
      return false;
    });
    this.#size = size;
    this.ratio = { x: 1, y: 1 };
    this.#sytemGroup = {} as {
      [p in SystemHook]: Array<CanveeExtensionSystem>;
    };
    SystemHooks.forEach((hookName) => {
      this.#sytemGroup[hookName] = this.systems.filter((sys) =>
        sys.registedHooks.includes(hookName),
      );
    });
    this.#willUseSubtreeSystems = this.systems.filter(
      (sys) => sys.willUseSubtree,
    );
    this.scene = new Scene({
      transform: {
        size,
      },
      name: "scene",
      canvee: this,
    });
    this.scene.notifyReRender = () => {
      this.markAsDirty();
    };
    this.scene.notifyTreeReBuild = () => {
      this.updateSystemSubTreeArr();
      this.markAsDirty();
      this.#sytemGroup.afterSystemTreeRebuild.forEach((s) =>
        s.afterSystemTreeRebuild(),
      );
    };

    this.init();
    this.start();
  }

  onResize(fn: (s: Size) => void) {
    this.#resizeFn = fn;
  }

  getRatio = () => ({
    x: this.canvas.width / this.canvas.clientWidth / this.devicePixelRatio,
    y: this.canvas.height / this.canvas.clientHeight / this.devicePixelRatio,
  });

  private init() {
    const absSize = {
      width: this.#size.width * this.devicePixelRatio,
      height: this.#size.height * this.devicePixelRatio,
    };
    this.canvas.width = absSize.width;
    this.canvas.height = absSize.height;
    this.ratio = this.getRatio();
    this.#stopWatchResize = watchResize(this.canvas, (s) => {
      this.ratio = this.getRatio();
      const newAbsSize = {
        width: s.width * this.devicePixelRatio,
        height: s.height * this.devicePixelRatio,
      };
      this.canvas.width = newAbsSize.width;
      this.canvas.height = newAbsSize.height;

      this.#resizeFn(s);

      const ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
      ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
      this.markAsDirty();
    });
  }

  private start() {
    this.updateSystemSubTreeArr();
    // beforeStart
    this.#sytemGroup.beforeSystemStart.forEach((sys) => {
      sys.setInstance(this);
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
      // beforeSystemNextLoop
      this.#sytemGroup.beforeSystemNextLoop.forEach((sys) => {
        sys.beforeSystemNextLoop();
      });
      // beforeSystemNextLoop
      window.requestAnimationFrame(loop);
    };

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
        comp.inflate(ctx);
      },
      () => {
        ctx.restore();
      },
    );
    // ctx.clip();
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

  updateSystemSubTreeArr() {
    this.#subtreeArr = getSubTreeArr(this.#willUseSubtreeSystems, this.scene);
  }

  getSubTreeForSystem(sys: CanveeExtensionSystem) {
    return this.#subtreeArr[
      this.#willUseSubtreeSystems.findIndex((s) => s === sys)
    ];
  }
}
