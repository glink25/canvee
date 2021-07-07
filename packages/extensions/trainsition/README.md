## Transiton

Transition Extension 为组件添加了动画效果，你可以通过如下方式为组件规定一些预先设置好的动作，
``` javascript
const transition = component.use(new Transiton({
    group: {
        idle: [
        {
            name: "scale.x",
            component,
            values: [
                { time: 0, value: 0, tween: Linear },
                { time: 1000, value: 1, tween: Linear },
            ],
        },
        {
            name: "scale.y",
            component,
            values: [
                { time: 0, value: 0, tween: Linear },
                { time: 1000, value: 1, tween: Linear },
            ],
        },
        ],
  },
}))
// 这将播放一次大小渐变的动画
transtion.play("idle",1)
```
其中 tween 参数与 Tween 类中的 curve 参数相同，接受一个缓动函数用于计算动画，置空则默认为Linear。

Transition是对Tween类的一个简单Extension封装，你也可以手动使用Tween来制造更多更丰富的的动态效果。