## Mask

Mask Extension可以为组件添加遮罩效果，通过源码可知，它仅仅为组件添加了 context.clip() 调用，因此它需要配合其他组件来完成遮罩，例如在Rect组件中使用Mask可以制造方形或圆角矩形遮罩。

你也可以自由使用context绘制多种类型的stroke形状，并通过Mask插件来完成遮罩裁剪。（或者直接手动调用context.clip() 😉）