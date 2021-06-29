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
  Tween,
  Sound,
  EventSystem,
  EventEmitter,
  Event,
  HitAreaType,
  DebugSystem,
  Debug,
  Mask,
  Shadow,
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
} from "./extensions/tween/ease";
import { mergeConfig } from "./utils";

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
  // extentions
  Tween,
  Sound,
  EventSystem,
  Event,
  EventEmitter,
  HitAreaType,
  DebugSystem,
  Debug,
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
