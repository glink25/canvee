import Component from "./component";
import Canvee from "./core";

export const ExtensionHooks = [
  "onAdded",
  "beforeDiscard",
  "beforeRender",
  "afterRender",
] as const;
export type ExtensionHook = typeof ExtensionHooks[number];

export class CanveeExtension {
  beforeDiscard(_c: Component) {}

  beforeRender(_c: Component, _ctx: CanvasRenderingContext2D) {}

  afterRender(_c: Component, _ctx: CanvasRenderingContext2D) {}

  onAdded(_c: Component) {}
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

export default class CanveeExtensionSystem {
  protected instance?: Canvee;

  readonly registedHooks: Array<SystemHook> = [];

  /**
   *
   *
   * @description is ExtensionSystem will use subtree which contains subExtension
   */
  willUseSubtree?: boolean;

  setInstance(c: Canvee) {
    this.instance = c;
  }

  /**
   *
   * @description here can get canvee instance
   */
  beforeSystemStart() {
    // here can get instance
  }

  beforeSystemNextLoop() {}

  beforeSystemReRender() {}

  beforeSystemStop() {}

  beforeComponentRender(_c: Component) {}

  afterSystemTreeRebuild() {}

  isMasterOf<T extends CanveeExtension>(_sys: T) {
    return false;
  }

  get subtree() {
    return this.instance?.getSubTreeForSystem(this);
  }
}
