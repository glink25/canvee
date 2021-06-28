export type DeepPartial<T> = T extends Function
  ? T
  : T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;
export type DeepRequied<T> = T extends Function
  ? T
  : T extends object
  ? { [P in keyof T]-?: DeepRequied<T[P]> }
  : T;
export type Color = CanvasFillStrokeStyles["fillStyle"] | "transparent";
export type Size = {
  width: number;
  height: number;
};
export type Position = {
  x: number;
  y: number;
};
export type Point = {
  x: number;
  y: number;
};
