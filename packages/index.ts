import {
  Circle,
  createBezierCurve,
  createGrid,
  Graphic,
  Img,
  Rect,
  Text,
} from "./components";
import Canvee, {
  Component,
  CanveeExtensionSystem,
  CanveeExtension,
} from "./core";
import {
  EventSystem,
  EventEmitter,
  Event,
  HitAreaType,
  DebugSystem,
  Debug,
  Mask,
  Shadow,
  Transition,
} from "./extensions";
import { useDragUnder } from "./extensions/event";
import {
  Linear,
  Circ,
  Cubic,
  Sine,
  Back,
  Bounce,
  Quad,
  Quart,
  Quint,
  Elastic,
  Expo,
} from "./utils/ease";
import { mergeConfig } from "./utils";
import { Tween, Sound } from "./extra";

export default Canvee;
export {
  CanveeExtensionSystem,
  CanveeExtension,
  Component,
  // components
  Text,
  Img,
  Graphic,
  Circle,
  Rect,
  // extra
  Tween,
  Sound,
  // extentions
  EventSystem,
  Event,
  EventEmitter,
  HitAreaType,
  DebugSystem,
  Debug,
  Transition,
  Mask,
  Shadow,
  useDragUnder,
  createGrid,
  createBezierCurve,
  mergeConfig,
  // Tween Curves
  Linear,
  Circ,
  Cubic,
  Sine,
  Back,
  Bounce,
  Quad,
  Quart,
  Quint,
  Elastic,
  Expo,
};
