import { CanveeExtension, Component } from "~/core";
import EventSystem from ".";

export const EVENT_MAP = {
  pointerdown: ["mousedown", "touchstart"],
  pointerup: ["mouseup", "touchend"],
  pointermove: ["mousemove", "touchmove"],
  // 只对鼠标事件有效
  pointerenter: ["mouseenter"],
  pointerleave: ["mouseleave"],
};

export enum HitAreaType {
  CIRCLE,
  // option: [x,y,radius,]
  POLYGON,
  // option: [x1,y1,x2,y2...]
  DEFAULT,
  // option: none
}
export type HitArea = {
  type: HitAreaType;
  option: Array<number>;
};
export type EventArg = {
  hitArea?: HitArea;
};

type RawEvent = MouseEvent | UIEvent | TouchEvent | PointerEvent;

export type EventEmitter = {
  x: number;
  y: number;
  current: Component;
  targets: Array<Component>;
  stopPropgation: () => void;
  raw: RawEvent;
};

export type ListenerType = (e: EventEmitter) => void;

export type PointerEventName = keyof typeof EVENT_MAP;

export default class Event implements CanveeExtension {
  /** @internal */
  events: Array<{ name: PointerEventName; fn: ListenerType; global?: boolean }>;

  hitArea: HitArea;

  constructor(arg?: EventArg) {
    let hitArea: HitArea;
    if (!arg?.hitArea) {
      hitArea = { type: HitAreaType.DEFAULT, option: [] };
    } else hitArea = arg.hitArea;
    this.hitArea = hitArea;
    this.events = [];
  }

  beforeDiscard(c: Component) {
    (
      c.scene?.canvee.getMasterSystem(this) as EventSystem | undefined
    )?.updateEventTree();
  }

  beforeRender() {}

  afterRender() {}

  onAdded() {}

  on(name: PointerEventName, fn: ListenerType) {
    this.events.push({ name, fn });
  }

  onGlobal(name: PointerEventName, fn: ListenerType) {
    this.events.push({ name, fn, global: true });
  }

  off(offName: PointerEventName, f: ListenerType) {
    this.events = this.events.filter(
      ({ name, fn }) => name !== offName && f === fn,
    );
  }
}
