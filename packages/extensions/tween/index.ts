import { CurveFunction } from "./ease";

type TweenArgs = {
  from: number;
  to: number;
  duration: number;
  curve: CurveFunction;
};

// const finished = (from: number, to: number, current: number): boolean =>
//   to > from ? current >= to : current <= to;

class Interval {
  quene: Array<{ name: string; fn: () => void }>;

  constructor() {
    this.quene = [];
    const step = () => {
      this.quene.forEach(({ fn }) => fn());
      window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }

  add(name: string, fn: () => void) {
    this.quene.push({ name, fn });
  }

  remove(n: string, f: () => void) {
    this.quene = this.quene.filter(({ name, fn }) => name !== n || f !== fn);
  }
}
// singleton refresh timer
const interval = new Interval();

export default class Tween {
  #tweens: Array<{
    from: number;
    to: number;
    duration: number;
    curve: CurveFunction;
  }>;

  #sliceFunc?: (v: number, p: number) => void;

  #afterFunc?: () => void;

  #step: () => void;

  // #ends: Array<() => void>;
  #name: string;

  #currentIndex: number;

  constructor(arg: TweenArgs) {
    this.#tweens = [];
    this.#tweens.push({ ...arg });
    this.#name = new Date().valueOf().toString();
    this.#step = () => {};
    // this.#ends = [];
    this.#currentIndex = -1;
  }

  play(loop = 1) {
    this.#currentIndex = 0;
    let timer = 0;
    const { length } = this.#tweens;
    let curLoop = 1;
    const onEnd = () => {
      if (curLoop < loop) {
        curLoop += 1;
        this.#currentIndex = 0;
        timer = 0;
      } else {
        interval.remove(this.#name, this.#step);
        this.#afterFunc?.();
      }
    };
    this.#step = () => {
      const { from, to, duration, curve } = this.#tweens[this.#currentIndex];
      const progress = ((timer / 60) * 1000) / duration;
      const value = curve((timer / 60) * 1000, from, to - from, duration);
      timer += 1;
      if (timer >= (duration / 1000) * 60) {
        this.#sliceFunc?.(value, progress);
        if (this.#currentIndex + 1 < length) {
          this.#currentIndex += 1;
          timer = 0;
        } else {
          onEnd();
        }
        return;
      }
      this.#sliceFunc?.(value, progress);
    };
    interval.add(this.#name, this.#step);
    return this;
  }

  tween(arg: TweenArgs) {
    this.#tweens.push({ ...arg });
    return this;
  }

  slicing(fn: (v: number, p: number) => void) {
    this.#sliceFunc = fn;
    return this;
  }

  after(fn: () => void) {
    this.#afterFunc = fn;
    return this;
  }

  pause() {
    interval.remove(this.#name, this.#step);
  }

  resume() {
    interval.add(this.#name, this.#step);
  }

  stop() {
    interval.remove(this.#name, this.#step);
  }
}
