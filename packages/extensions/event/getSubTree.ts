import { Component } from "~/core";
import { Scene } from "~/core/component";
import Event from "./event";

export class Node {
  node: Component;

  children: Array<Node>;

  constructor(node: Component) {
    this.node = node;
    this.children = [];
  }

  pushChild(c: Component) {
    const n = new Node(c);
    this.children.push(n);
    return n;
  }

  popChild() {
    this.children.pop();
  }
}
const hasEvent = (c: Component) => c.usages.some((u) => u instanceof Event);
/**
 *
 *
 * @description create a subtree of component tree which component used event
 */
export default function getSubTree(scene: Scene) {
  const travel = (c: Component): Node | undefined => {
    if (c.children.length > 0) {
      const node = new Node(c);
      c.children.forEach((child) => {
        const res = travel(child);
        if (res) node.children.push(res);
      });
      if (node.children.length > 0 || hasEvent(c)) return node;
      return undefined;
    }
    return hasEvent(c) ? new Node(c) : undefined;
  };
  const node = travel(scene);

  return node;
}
