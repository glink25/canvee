import { CanveeExtension, Component } from "~/core";
import { CurveFunction, Linear } from "~/utils/ease";
import { Tween } from "~/extra";

type TransiontionArg = {
  group: {
    [trainsitionNames: string]: {
      name: string;
      component: Component;
      values: Array<{
        time: number;
        tween?: CurveFunction;
        value: number;
      }>;
    }[];
  };
};

const setTransform = (name: string, comp: Component, v: number) => {
  const [m, k] = name.split(".");
  if (k) {
    comp.transform[m][k] = v;
  } else {
    comp.transform[m] = v;
  }
};

export default class Transition implements CanveeExtension {
  readonly group: TransiontionArg["group"];

  // #timer: number = 0;
  #currentPlayName = "";

  #tweenGroup: { [propName: string]: Array<Tween> };

  constructor(args: TransiontionArg) {
    this.group = args.group;
    this.#tweenGroup = {};
    this.setTweenGroup();
  }

  private setTweenGroup() {
    Object.entries(this.group).forEach(([name, value]) => {
      const tweens = value
        .map((v) => {
          const comp = v.component;
          const tween = v.values
            .sort((v1, v2) => v1.time - v2.time)
            .reduce((p, c, i, arr) => {
              if (i === 0) return p;
              const l = arr[i - 1];
              if (i === 1) {
                const t = new Tween({
                  from: l.value,
                  to: c.value,
                  duration: c.time - l.time,
                  curve: c.tween ?? Linear,
                }).slicing((x) => {
                  setTransform(v.name, comp, x);
                });
                return t;
              }
              (p as unknown as Tween).tween({
                from: l.value,
                to: c.value,
                duration: c.time - l.time,
                curve: c.tween ?? Linear,
              });
              return p;
            }, undefined as unknown as Tween);
          return tween;
        })
        .sort((t1, t2) => t2.getTotalDuration() - t1.getTotalDuration());
      this.#tweenGroup[name] = tweens;
    });
  }

  play(name: string, num: number, after?: () => void) {
    this.#currentPlayName = name;
    const tween = this.#tweenGroup[name];
    if (tween) {
      tween.forEach((t, i) => {
        if (i === 0 && after) t.play(num).after(after);
        else t.play(num);
      });
    }
  }

  stop() {
    const tween = this.#tweenGroup[this.#currentPlayName];
    if (tween) {
      tween.forEach((t) => {
        t.stop();
      });
    }
  }

  pause() {
    const tween = this.#tweenGroup[this.#currentPlayName];
    if (tween) {
      tween.forEach((t) => {
        t.pause();
      });
    }
  }

  resume() {
    const tween = this.#tweenGroup[this.#currentPlayName];
    if (tween) {
      tween.forEach((t) => {
        t.resume();
      });
    }
  }

  onAdded() {}

  beforeDiscard() {
    // (
    //   c.scene?.canvee.getMasterSystem(this) as TransitionSystem | undefined
    // )?.updateTrainsitionTree();
  }

  beforeRender() {}

  afterRender() {}
}
