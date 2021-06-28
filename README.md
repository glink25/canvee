## 介绍

Canvee是一个轻量级的 canvas 绘图框架，它使用组件式的开发方式，并使用 canvas 原生方法来绘制组件，体积轻巧，避免了使用其他 canvas 渲染引擎需要了解的新概念和心智负担，也极大减少了应用体积，适用于小游戏制作和嵌入H5页面开发。

麻雀虽小，五脏俱全，Canvee 拥有一个完整的鼠标事件响应系统 EventSystem，以及transform形变和定位机制，足以胜任大多数简单的canvas开发需求。

## 使用方法

1，新建一个 Canvee 类，并将 canavs 节点作为参数传入构造函数中。

```javascript
const canvasSystem = new Canvee({
  canvas: document.getElementById("canvas")
  size: {
      width:600,
      height:600
      },
  systems:[
    new EventSystem()
    // 加载事件系统，使Canvee组件能够响应鼠标事件
  ],
  devicePixelRatio: window.devicePixelRatio,
});
```

2，使用 Img、Text 等子类生成 Component 组件，并使用 addChild 方法将其挂载到 Canvee 实例的 scene 对象中，即可渲染出组件。

```javascript
const img = new Img({
  image: coinImgSrc,
  transform: {
    zIndex: 100,
    anchor: { x: 0.5, y: 0.5 },
  },
  name: "img",
});
canvee.scene.addChild(img);
```

组件的定位由 transform 属性中的 origin 和 anchor 决定，并根据 position 进行偏移。

```
origin：表示组件自身的原点位置
anchor：表示组件原点位于父组件的百分比位置
position：表示组件相对于原点的偏移量
```

3，修改组件的 transform 或其他响应式属性会触发视图重新渲染。

4，使用 Tween 类来构造过渡动画。
```javascript
const tween=new Tween({from:0,to:100,duration:1000,curve:Cubic.easeIn})
  .tween({from:100,to:0,duration:1000,curve:Cubic.easeIn})
  // 支持连接多个参数
  .slicing((v)=>{
    rect.transform.position.x=v
  })
tween.play(1)
```

5，使用 EventSystem 来使用事件，这里只采用了最简单的事件冒泡机制，只代理了部分鼠标和触控事件。使用 hitArea 参数可以设置事件的响应区域，默认是组件的矩形区域。

```javascript
const evt = img.use(
  new Event({
    hitArea: {
      type: HitAreaType.CIRCLE,
      option: [0, 0, 50],
    },
  })
);
evt.on("pointerup", (e) => {
  console.log(e);
  // e中的位置是指针相对于canvas的相对位置
});
```
