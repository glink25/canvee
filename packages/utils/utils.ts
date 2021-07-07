import { Size } from "~/type";

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

// const deepClone = <T>(target: T): T => JSON.parse(JSON.stringify(target));

function deepClone<T extends object | Array<unknown>>(obj: T): T {
  const objClone = Array.isArray(obj) ? [] : {};
  if (obj && typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      if (obj[key] && typeof obj[key] === "object") {
        objClone[key] = deepClone(obj[key]);
      } else {
        objClone[key] = obj[key];
      }
    });
  }
  return objClone as T;
}

const mergeConfig = <T extends object>(
  defaultConfig: T,
  custom?: Partial<T>,
): T => {
  if (!custom) return { ...defaultConfig } as T;
  const newCustom = deepClone(custom);
  Object.entries(defaultConfig).forEach(([k, v]) => {
    type keys = keyof typeof newCustom;
    if (!newCustom[k as keys]) newCustom[k as keys] = v;
  });
  return newCustom as T;
};

export default {};
export { watchResize, deepClone, mergeConfig };
