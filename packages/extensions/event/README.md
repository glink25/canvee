## Event

Event Extension为Canvee组件添加了鼠标和触摸事件响应，它需要在Canvee构造时加入EventSystem。
通过简单地使用Event.on方法，即可监听到指针事件，包括
```
pointerdown
pointerup
pointermove

// 只对鼠标事件有效
  pointerenter
  pointerleave
```
同时也可以使用onGlobal方法监听全局的事件。

可以通过传入HitAreaType来确定点击区域，默认为组件的size矩形区域

通过Event获取到的坐标信息为Canvee内部定位的位置，如果想获取原始事件，可以通过 e.raw 获取。

## Notice

Event事件默认会一直向父组件冒泡，除非在过程中显式地调用了 e.stopPropagation 。

