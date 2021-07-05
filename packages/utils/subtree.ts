import { Component } from "~/core";
import { Scene } from "~/core/component";

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

const getSubTree = (scene: Scene, match: (x: Component) => boolean) => {
  const travel = (c: Component): Node | undefined => {
    if (c.children.length > 0) {
      const node = new Node(c);
      c.children.forEach((child) => {
        const res = travel(child);
        if (res) node.children.push(res);
      });
      if (node.children.length > 0 || match(c)) return node;
      return undefined;
    }
    return match(c) ? new Node(c) : undefined;
  };
  const node = travel(scene) ?? new Node(scene);

  return node;
};

export default getSubTree;
