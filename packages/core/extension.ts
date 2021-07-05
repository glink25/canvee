import Component from "./component";
import Canvee from "./core";

export const ExtensionHooks = [
  "onAdded",
  "beforeDiscard",
  "beforeRender",
  "afterRender",
] as const;
export type ExtensionHook = typeof ExtensionHooks[number];

export interface CanveeExtension {
  // readonly registedHooks: Array<ExtensionHook>;
  onAdded: (c: Component) => void;
  beforeDiscard: (c: Component) => void;
  beforeRender: (c: Component, ctx: CanvasRenderingContext2D) => void;
  afterRender: (c: Component, ctx: CanvasRenderingContext2D) => void;
}

export const SystemHooks = [
  "beforeSystemStart",
  "beforeSystemNextLoop",
  "beforeSystemReRender",
  "beforeSystemStop",
  "beforeComponentRender",
  "afterSystemTreeRebuild",
] as const;
export type SystemHook = typeof SystemHooks[number];

export default interface CanveeExtensionSystem {
  instance?: Canvee;
  readonly registedHooks: Array<SystemHook>;

  beforeSystemStart: () => void;

  beforeSystemNextLoop: () => void;

  beforeSystemReRender: () => void;

  beforeSystemStop: () => void;

  beforeComponentRender: (_c: Component) => void;

  afterSystemTreeRebuild: () => void;

  isMasterOf: <T extends CanveeExtension>(sys: T) => boolean;
}
