import Component, { ComponentArg } from "~/core/component";
import Canvee from "~/core/core";
import CanveeExtensionSystem, {
  CanveeExtension,
  SystemHook,
} from "~/core/extension";
import { DeepRequied, Point } from "~/type";
import { travelTreeable } from "~/utils";
import Event, {
  EventEmitter,
  EVENT_MAP,
  HitArea,
  HitAreaType,
  ListenerType,
} from "./event";

// function getEventSubtree(scene) {
//   return getSubTree(scene, (c) => c.usages.some((u) => u instanceof Event));
// }

function defineHitArea(
  ctx: CanvasRenderingContext2D,
  hitArea: HitArea,
  transform: DeepRequied<ComponentArg>["transform"],
) {
  const { origin, size } = transform;
  const getRealPoint = (x: number, y: number): [number, number] => {
    return [size.width * origin.x + x, size.height * origin.y + y];
  };
  let x;
  let y;

  switch (hitArea.type) {
    case HitAreaType.CIRCLE:
      let radius;
      [x, y, radius] = hitArea.option;
      ctx.arc(...getRealPoint(x, y), radius, 0, 360);
      ctx.stroke();
      return;
    case HitAreaType.POLYGON:
      if (hitArea.option.length % 2 !== 0 || hitArea.option.length === 0)
        return;
      for (let i = 0; i < hitArea.option.length; i += 2) {
        x = hitArea.option[i];
        y = hitArea.option[i + 1];
        if (i === 0) {
          ctx.beginPath();
          ctx.moveTo(...getRealPoint(x, y));
        } else {
          ctx.lineTo(...getRealPoint(x, y));
        }
      }
      ctx.stroke();
      return;
    default:
      ctx.rect(0, 0, size.width, size.height);
  }
}

function matchEvent(name: string, targetName: string) {
  if (name === targetName) return true;
  return EVENT_MAP[name as keyof typeof EVENT_MAP]?.includes(targetName);
}

type EventSystemArg = {
  preventScroll?: boolean;
};

const EventNames = [
  "mousemove",
  "mousedown",
  "mouseup",
  "mouseenter",
  "mouseleave",
  "touchstart",
  "touchmove",
  "touchcancel",
  "touchend",
];

export default class EventSystem extends CanveeExtensionSystem {
  #copyCanvas: HTMLCanvasElement;

  #listenFn: Array<(e: any) => void> = [];

  prventScroll: boolean;

  constructor(arg?: EventSystemArg) {
    super();
    this.prventScroll = arg?.preventScroll ?? false;
    this.#copyCanvas = document.createElement("canvas");
    this.willUseSubtree = true;
  }

  registedHooks = [
    "beforeSystemStart",
    "beforeSystemStop",
    "afterSystemTreeRebuild",
  ] as Array<SystemHook>;

  /** @internal */
  // updateEventTree() {
  //   this.#eventTree = getEventSubtree(this.instance!.scene);
  // }

  // afterSystemTreeRebuild() {
  //   this.updateEventTree();
  // }

  beforeSystemStart() {
    if (!this.instance) return;
    // this.updateEventTree();
    const { instance } = this;
    const ctx = this.#copyCanvas.getContext("2d") as CanvasRenderingContext2D;

    const transformPosition = (pos: Point, ins: Canvee) => {
      const bound = ins.canvas.getBoundingClientRect();
      return {
        x: (pos.x - bound.x) * ins.ratio.x,
        y: (pos.y - bound.y) * ins.ratio.y,
      };
    };
    let movePositions: TouchList;
    this.#listenFn = EventNames.map((name) => {
      const getEventPosition = (e: any): { x: number; y: number } => {
        let ev;
        if (e.touches) {
          if (e.touches[0]) [ev] = e.touches;
          else {
            const endPos = movePositions[movePositions.length - 1];
            ev = endPos;
          }
        } else ev = e;
        return transformPosition(
          {
            x: ev.clientX,
            y: ev.clientY,
          },
          instance,
        );
      };
      const fn = (e: MouseEvent | UIEvent | TouchEvent | PointerEvent) => {
        if (name === "touchmove" || name === "touchstart") {
          // touchend事件无坐标，需要手动记录move事件
          movePositions = (e as TouchEvent).touches;
          if (this.prventScroll) e.preventDefault();
        }
        const clientPosition = getEventPosition(e);
        const eventX = clientPosition.x;
        const eventY = clientPosition.y;

        const targets: Array<{
          target: Component;
          event: { name: string; fn: ListenerType }[];
        }> = [];
        const globalTargets: Array<{
          target: Component;
          event: { name: string; fn: ListenerType }[];
        }> = [];
        let isPrevent = false;
        const listener: EventEmitter = {
          x: eventX,
          y: eventY,
          current: null as unknown as Component,
          targets: targets.map((t) => t.target),
          stopPropgation() {
            isPrevent = true;
          },
          raw: e,
        };
        if (!this.subtree) return;
        travelTreeable(
          this.subtree,
          ({ node: c }) => {
            ctx.save();
            c.setContext(ctx);
            // c.render(ctx);
            // render会导致渲染多个component时的卡顿，使用beginPath代替
            ctx.beginPath();
            if (
              (
                c.usages.find((u) => this.isMasterOf(u)) as Event | undefined
              )?.events.some((v) => matchEvent(v.name, name))
            ) {
              const eventUsage = c.usages.find(
                (u) => u instanceof Event,
              ) as unknown as Event;

              if (eventUsage) {
                const ev = eventUsage.events.filter((v) =>
                  matchEvent(v.name, name),
                );
                ctx.save();

                defineHitArea(ctx, eventUsage.hitArea, c.transform);

                if (ctx.isPointInPath(eventX, eventY)) {
                  // collect targets
                  targets.push({ target: c, event: ev });
                }
                const gev = ev.filter((x) => x.global);
                globalTargets.push({ target: c, event: gev });
                ctx.restore();
              }
              ctx.closePath();
            }
          },
          () => {
            ctx.restore();
          },
        );
        targets.reverse().some((t) => {
          listener.current = t.target;
          t.event.forEach((x) => x.fn(listener));

          return isPrevent;
        });
        globalTargets.reverse().forEach((t) => {
          t.event.forEach((x) => x.fn(listener));
        });
      };
      this.instance?.canvas.addEventListener(name, fn as any);
      return fn;
    });
  }

  beforeSystemStop() {
    EventNames.forEach((name, i) => {
      this.instance?.canvas.removeEventListener(name, this.#listenFn[i]);
    });
  }

  isMasterOf(usage: CanveeExtension) {
    return usage instanceof Event;
  }
}

type MoveType = {
  offset: Point;
  begin: Point;
};

const useDragUnder = (() => {
  return (
    _globalComponent: Component,
    callback: (comp: Component, move: MoveType) => void,
  ) => {
    const useDrag = (comp: Component) => {
      const cevt = comp.use(new Event());

      let isMouseDown = false;
      let lastEvent: EventEmitter;
      let lastPosition: Point;
      const evt = comp.use(new Event());
      evt.on("pointerdown", (e) => {
        isMouseDown = true;
        lastEvent = e;
        lastPosition = { ...comp.transform.position };
        e.stopPropgation();
      });
      const mf = (e: EventEmitter) => {
        if (isMouseDown) {
          // comp.transform.position.x = lastPosition.x + e.x - lastEvent.x;
          // comp.transform.position.y = lastPosition.y + e.y - lastEvent.y;
          const move: MoveType = {
            offset: {
              x: e.x - lastEvent.x,
              y: e.y - lastEvent.y,
            },
            begin: {
              x: lastPosition.x,
              y: lastPosition.y,
            },
          };
          callback(comp, move);
          e.stopPropgation();
        }
      };
      const uf = () => {
        isMouseDown = false;
      };

      cevt.onGlobal("pointermove", mf);
      cevt.onGlobal("pointerup", uf);
    };
    return useDrag;
  };
})();

export { useDragUnder };
