import { CurveFunction } from "~/utils/ease";
import interval from "~/utils/interval";

type TweenArgs = {
  from: number;
  to: number;
  duration: number;
  curve: CurveFunction;
};

enum Status {
  Stopped,
  Playing,
  Paused,
}

// 非Canvee extension，可以单独使用
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

  #status = Status.Stopped;

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
    this.#status = Status.Playing;
    let newFrame = Math.floor(interval.getFrame());
    const onEnd = () => {
      if (curLoop < loop) {
        curLoop += 1;
        this.#currentIndex = 0;
        timer = 0;
        newFrame = Math.floor(interval.getFrame());
      } else {
        interval.remove(this.#name, this.#step);
        this.#status = Status.Stopped;
        this.#afterFunc?.();
      }
    };

    this.#step = () => {
      const { from, to, duration, curve } = this.#tweens[this.#currentIndex];
      const getFrame = () => {
        return newFrame;
      };
      const frame = getFrame();

      const progress = ((timer / frame) * 1000) / duration;
      const value = curve((timer / frame) * 1000, from, to - from, duration);

      if (timer >= (duration / 1000) * frame) {
        this.#sliceFunc?.(
          to,
          this.#tweens.reduce(
            (p, c, i) => (this.#currentIndex <= i ? p + c.duration : p),
            0,
          ) / this.#tweens.reduce((p, c) => p + c.duration, 0),
        );
        if (this.#currentIndex + 1 < length) {
          this.#currentIndex += 1;
          timer = 0;
        } else {
          onEnd();
        }
        return;
      }
      this.#sliceFunc?.(value, progress);
      timer += 1;
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
    this.#status = Status.Paused;
    interval.remove(this.#name, this.#step);
  }

  resume() {
    if (this.#status === Status.Paused) {
      interval.add(this.#name, this.#step);
      this.#status = Status.Playing;
    }
  }

  stop() {
    interval.remove(this.#name, this.#step);
  }

  getTotalDuration() {
    return this.#tweens.reduce((p, c) => p + c.duration, 0);
  }
}
