import { Size } from "~/type";
import Component from "../core/component";

const slowDeepClone = <T>(target: T): T => JSON.parse(JSON.stringify(target));

export function mergeConfig<T extends object>(
  defaultConfig: T,
  custom?: Partial<T>,
): T {
  if (!custom) return { ...defaultConfig } as T;
  const newCustom = slowDeepClone(custom);
  Object.entries(defaultConfig).forEach(([k, v]) => {
    type keys = keyof typeof newCustom;
    if (!newCustom[k as keys]) newCustom[k as keys] = v;
  });
  return newCustom as T;
}

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

const reactive = <T extends object>(
  target: T,
  notifyChange: (v: any) => void,
): T => {
  if (typeof target !== "object" || target == null) {
    // 不是对象或数组，则返回
    return target;
  }
  Object.entries(target).forEach(([key, value]) => {
    Object.defineProperty(target, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 当取值时调用的方法
        return reactive(value, notifyChange);
      },
      set(newValue) {
        if (newValue !== value) {
          notifyChange(newValue);
          value = reactive(newValue, notifyChange); // 如果是设置的是对象继续劫持
        }
        return newValue;
      },
    });
  });
  return target;
};

const reactiveProxy = <T extends object>(
  target: T,
  notifyChange: (v: any) => void,
): T => {
  if (typeof target !== "object" || target == null) {
    // 不是对象或数组，则返回
    return target;
  }

  // 代理配置
  const proxyConf: ProxyHandler<T> = {
    get(t, key, receiver) {
      // 只处理本身（非原型的）属性
      const ownKeys = Reflect.ownKeys(t);
      if (ownKeys.includes(key)) {
        // 监听
      }
      const result = Reflect.get(target, key, receiver);
      return reactiveProxy(result, notifyChange);
    },
    set(t, key, val, receiver) {
      // 重复的数据，不处理
      if (val === t[key as keyof T]) {
        return true;
      }

      const ownKeys = Reflect.ownKeys(t);
      if (ownKeys.includes(key)) {
        // "已有的 key", key
      } else {
        // "新增的 key", key
      }

      const result = Reflect.set(target, key, val, receiver);
      // "set", key, val
      notifyChange(target);
      return result; // 是否设置成功
    },
    deleteProperty(t, key) {
      const result = Reflect.deleteProperty(t, key);
      // "delete property", key
      notifyChange(target);
      return result; // 是否删除成功
    },
  };

  // 生成代理对象
  const observed = new Proxy(target, proxyConf);
  return observed;
};

const nextick = (fn: () => void) => {
  Promise.resolve().then(() => {
    fn();
  });
  // in iOS here needs a trick to flush microtask quene
};

const watchResize = (el: HTMLElement, callback: (s: Size) => void) => {
  const getSize = () => ({ width: el.clientWidth, height: el.clientHeight });
  let size = getSize();
  if (typeof window.ResizeObserver !== "undefined") {
    const resizeObserver = new ResizeObserver(() => {
      callback(getSize());
    });
    resizeObserver.observe(el);
    window.onresize = () => {
      callback(getSize());
    };
    const stop = () => {
      resizeObserver.disconnect();
    };
    return stop;
  }

  const timer = setInterval(() => {
    if (el.clientWidth !== size.width || el.clientHeight !== size.height) {
      size = getSize();
      callback(size);
    }
  }, 500);
  const stop = () => {
    clearInterval(timer);
  };
  return stop;
};

function getClassName(obj: object) {
  if (obj && obj.constructor && obj.constructor.toString()) {
    if (obj.constructor.name) {
      return obj.constructor.name;
    }
    const str = obj.constructor.toString();
    let arr;
    if (str.charAt(0) === "[") {
      arr = str.match(/\w+\s∗(\w+)\w+\s∗(\w+)/);
    } else {
      arr = str.match(/function\s*(\w+)/);
    }
    if (arr && arr.length === 2) {
      return arr[1];
    }
  }
  return "";
}

const getId = (() => {
  let i = 0;
  // eslint-disable-next-line no-plusplus
  return () => i++;
})();

export {
  reactive,
  reactiveProxy,
  slowDeepClone,
  travelComponent,
  travelTreeable,
  nextick,
  watchResize,
  getClassName,
  getId,
};
