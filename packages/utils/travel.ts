import { Component } from "~/core";

type TreeAble<T> = {
  children: Array<TreeAble<T>>;
} & T;

const travelTreeable = <T>(
  root: TreeAble<T>,
  before: (c: TreeAble<T>) => void,
  after?: (c: TreeAble<T>) => void,
) => {
  before(root);
  if (root.children.length) {
    root.children.forEach((child) => {
      travelTreeable(child, before, after);
    });
  }
  after?.(root);
};

const travelComponent = (
  root: Component,
  before: (c: Component) => void,
  after?: (c: Component) => void,
) => {
  travelTreeable(root, before, after);
};
export default travelTreeable;
export { travelComponent };
