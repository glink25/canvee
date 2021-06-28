/* eslint-disable class-methods-use-this */

import Graphic from "~/components/graphic";
import Text from "~/components/text";
import Component from "~/core/component";
import Canvee from "~/core/core";
import CanveeExtensionSystem, {
  CanveeExtension,
  SystemHook,
} from "~/core/system";

const getFrameComp = () => {
  const SIZE = {
    width: 50,
    height: 50,
  };
  const frameComp = new Component({
    transform: {
      anchor: { x: 1, y: 0 },
      position: { x: -SIZE.width / 2, y: SIZE.height / 2 },
      zIndex: 100,
      size: SIZE,
    },
  });
  const text = new Text({
    text: "FPS: 0",
    style: {
      fontSize: 12,
      textAign: "left",
    },
    transform: {
      origin: {
        x: 0.5,
        y: 0.5,
      },
      position: { x: 0, y: 10 },
      anchor: {
        x: 0,
        y: 0,
      },
    },
  });
  let hieghts = [0];

  const lines = new Graphic({
    transform: {
      anchor: {
        x: 0,
        y: 0,
      },
      alpha: 0.6,
    },
    draw: (ctx) => {
      ctx.fillStyle = "red";
      ctx.fillRect(0, 0, SIZE.width, SIZE.height);
      const WEIGHT = 2;

      ctx.fillStyle = "black";
      ctx.lineWidth = WEIGHT;
      ctx.beginPath();
      hieghts.forEach((h, i) => {
        const x = SIZE.width - WEIGHT - i;
        ctx.moveTo(x, SIZE.height - h);

        ctx.lineTo(x, SIZE.height);
        ctx.stroke();
      });
    },
  });
  const setText = (t: string, h?: number[]) => {
    hieghts = h
      ? h
          .slice(-48)
          .map((e) => (e * SIZE.height) / 100)
          .reverse()
      : hieghts;
    text.text = `FPS: ${t}`;
    lines.forceUpdate();
  };
  frameComp.addChild(lines);
  frameComp.addChild(text);
  return [frameComp, setText] as [typeof frameComp, typeof setText];
};

class Frames {
  frames: Array<number>;

  maxFrameLength: number;

  constructor() {
    this.maxFrameLength = 100;
    this.frames = [];
  }

  addFrame(frame: number) {
    if (this.frames.length === this.maxFrameLength) {
      this.frames.shift();
    }
    this.frames.push(frame);
  }

  get averageFrame() {
    const NUM = 2;
    if (this.frames.length < NUM) return this.frames[this.frames.length - 1];
    return (
      new Array(NUM)
        .fill(0)
        .map((_, i) => this.frames[this.frames.length - i - 1])
        .reduce((a, b) => a + b) / 2
    );
  }
}

export class Debug implements CanveeExtension {
  showBorder: boolean;

  constructor() {
    this.showBorder = false;
  }

  onAdded() {}
}

export default class DebugSystem implements CanveeExtensionSystem {
  frameComp: Component;

  frames: Frames;

  flagCount: number;

  flagComp?: Component;

  flagTime?: Date;

  timer: NodeJS.Timeout;

  instance?: Canvee;

  registedHooks = [
    "beforeSystemStart",
    "beforeSystemNextLoop",
    "beforeSystemStop",
  ] as Array<SystemHook>;

  constructor() {
    this.frames = new Frames();
    this.flagCount = 0;
    const [comp, setText] = getFrameComp();
    this.frameComp = comp;
    let lastTime = new Date();
    let lastCount = 0;
    const DURATION = 500;
    this.timer = setInterval(() => {
      const timeDiff = new Date().valueOf() - lastTime.valueOf();
      lastTime = new Date();
      const diff = this.flagCount - lastCount;
      // const frame = ((DURATION / timeDiff) * diff * 1000) / DURATION;
      const frame = (1 / timeDiff) * diff * 1000;
      this.frames.addFrame(frame);
      setText(
        Math.round(this.frames.averageFrame).toString(),
        this.frames.frames,
      );
      lastCount = this.flagCount;
    }, DURATION);
  }

  beforeSystemReRender() {}

  afterSystemTreeRebuild() {}

  isMatserOf(usage: CanveeExtension) {
    return usage instanceof Debug;
  }

  beforeSystemStop() {
    window.clearInterval(this.timer);
  }

  beforeSystemNextLoop() {
    this.flagCount += 1;
  }

  beforeSystemStart() {
    this.instance!.scene.addChild(this.frameComp);
  }

  beforeComponentRender(_c: Component) {}
}
