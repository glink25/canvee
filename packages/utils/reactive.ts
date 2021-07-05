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
export default reactive;
export { reactiveProxy };
