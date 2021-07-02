type EmitListener = {
  target: any;
  value: any;
};
type Emitter = {
  name: string;
  func: (e: EmitListener) => boolean | void;
};
export default class Dispatcher {
  protected eventMap: { [propName: string]: Array<Emitter["func"]> } = {};

  /**
   *
   * @description the listener function return true means stop event buuble
   *
   */
  on(name: string, fn: Emitter["func"]) {
    if (!this.eventMap[name]) this.eventMap[name] = [];
    this.eventMap[name].push(fn);
  }

  off(name: string, fn: Emitter["func"]) {
    this.eventMap[name] = this.eventMap[name].filter((e) => e !== fn);
  }
}
