## Graphic

Graphic组件允许你直接调用canvas.getContext("2d")得到的context对象直接绘制，参考Curve组件的实现。

在使用Graphic组件绘制时，context的位置和原点都已经根据transform属性被设置好了，在
``` javascript
ctx.rect(0,0,size,width,size.height)
```
中，（0，0）始终代表Component的左上角位置。
