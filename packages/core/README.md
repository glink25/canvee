## Core

这里定义了Canvee的核心类和Component基类，以及Extension和ExtensionSystem的接口，你可以通过继承或者实现这些接口中定义的属性和方法来创建自定义的Component和Extension。

# Canvee
Canvee构造函数需要提供预定义的画布size，并需要指定一个HTMLCanvasElement给Canvee。

如果你选择让Canvee绑定一个已经设置好的canvas对象，则Canvee中的1长度单位可能会不等于1px，导致绘制的图像被拉伸变形，类似的情况还会出现在画布大小被改变的时候，如果你希望控制各种情况下显示的画面比例，你可以在Canvee的onResize方法中动态修改Canvee.scene的size。
``` javascript
const canvee=new Canvee({
    size:{
        width:350,
        height:714
    },
    canvas:document.querySelector("canvas")
})
canvee.onResize=((s)=>{
    canvee.scene.transform.size.width = s.width
    canvee.scene.transform.size.height = s.height
})
```

## Component
Component是Canvee中的基础组件，所有组件都是Component的子类。component具有一个响应式属性transform，通过transform属性Canvee可以准确绘制组件的位置和形变，通过改变transform的子属性值可以触发视图渲染，并根据transform值绘制组件的新图像。

transform的子属性如下：
```
size：组件的大小
origin：组件自身的原点位置，其他形变都基于此变换
anchor：组件原点位于父组件的百分比位置
position：组件相对于原点的偏移量

rotate：组件的旋转角度（0-360）
scale：组件相对于原始大小的缩放
skew：组件的斜切值

zIndex：兄弟组件的zIndex值，较大的zIndex值不会被较小值的component遮盖
alpha：组件的透明度，每个组件都是独立的，不会相对于父组件
```
Canvee在渲染时会依照顺序依次设置组件的矩阵变换，不必担心先后顺序造成的变换差异。

``` javascript
// 改变componnet的x轴偏移量
component.transform.size.x = 10

// 尽可能不要将一个新对象赋整体给transform的子属性,尽管效果相同，但可能导致失去响应性或出现其他意想不到的效果
component.transform.size = { x : 10, y : 10 }

// 改写为这样会好得多
component.transform.size.x = 10
component.transform.size.y = 10
```

Component同时也是Dispatcher的子类，可以通过emit方法向父组件传递事件，减少回调函数的嵌套。

## Extension
Extension是Canvee的重要拓展方式，它暴露了组件内部的生命周期钩子，可以为组件渲染提供更多可能性
``` javascript
// 通过Event Extension为组件添加点击事件
const event = component.use(new Event())
event.on("pointerdown",()=>{
    console.log("component pressed")
})
```

## ExtensionSystem
有时候Extension不够完成我们想要的功能，可以通过ExtensionSystem介入到Canvee的运行时。ExtensionSystem需要在创建Canvee实例时就提供好，不支持动态添加或者移除。一些Extension需要配合对应的ExtensionSystem使用。

为了减少钩子开销，需要为ExtensionSystem指定用到的SystemHook数组，减少无用的遍历。