export type EmitOption = { bubble?: boolean };

type EmitListener<T> = {
  target: T;
  value: unknown;
};
type Emitter<T> = {
  name: string;
  func: (e: EmitListener<T>) => boolean | void;
};
export default class Dispatcher<T extends Dispatcher<T>> {
  protected eventMap: { [propName: string]: Array<Emitter<T>["func"]> } = {};

  parent?: T;

  /**
   *
   * @description listen a emit event
   * the listener function return true means stop event buuble
   */
  on(name: string, fn: Emitter<T>["func"]) {
    if (!this.eventMap[name]) this.eventMap[name] = [];
    this.eventMap[name].push(fn);
  }

  /**
   *
   * @description stop listening
   */
  off(name: string, fn: Emitter<T>["func"]) {
    this.eventMap[name] = this.eventMap[name].filter((e) => e !== fn);
  }

  /** @internal */
  recieve(comp: T, name: string, value?: unknown, option?: EmitOption) {
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
   * @param {EmitOption} [option] option.bubble set as true means to make the event
   * continual passed to the parent component until Scene
   */
  emit(name: string, value?: unknown, option?: EmitOption) {
    this.recieve(this as unknown as T, name, value, option);
  }
}
