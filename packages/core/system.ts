import Component from "./component";
import Canvee from "./core";

export interface CanveeExtension {
  onAdded: (c: Component) => void;
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

  isMatserOf: <T extends CanveeExtension>(sys: T) => boolean;
}
