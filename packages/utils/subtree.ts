import { CanveeExtensionSystem, Component } from "~/core";
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

const getSubTreeArr = (systems: Array<CanveeExtensionSystem>, scene: Scene) => {
  const travel = (c: Component): (Node | 0)[] => {
    if (c.children.length > 0) {
      const nodes = systems.map(() => new Node(c));
      c.children.forEach((child) => {
        const res = travel(child);
        nodes.forEach((p, i) => {
          if (res[i] !== 0) {
            p.children.push((res as Node[])[i]);
          }
        });
      });
      return nodes;
    }
    return systems.map((sys) =>
      c.usages.some((u) => sys.isMasterOf(u)) ? new Node(c) : 0,
    );
  };
  const arr = travel(scene) ?? [new Node(scene)];

  return arr;
};

export default getSubTree;
export { getSubTreeArr };
